import type { Request, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { minutesToMilliseconds, secondsToMilliseconds } from 'date-fns';
import {
    AuthorizationTokenKind,
    parseAuthorizationToken,
} from '../authentication/authorization-token.js';
import type { IUnleashConfig } from '../types/option.js';

type RateLimitOptions = {
    windowMs: number;
    limit: number;
};

type AuthenticatedRateLimitOptions = RateLimitOptions & {
    tokenKinds?: AuthorizationTokenKind[];
};

export type RateLimitStage = 'beforeAuthentication' | 'afterAuthentication';

type RateLimitRule = {
    pathPrefixes?: string[];
    methods?: string[];
    beforeAuthentication?: RateLimitOptions;
    afterAuthentication?: AuthenticatedRateLimitOptions;
};

const formatWindow = (windowMs: number): string => {
    const minute = minutesToMilliseconds(1);
    const second = secondsToMilliseconds(1);

    if (windowMs % minute === 0) {
        const minutes = windowMs / minute;
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }

    if (windowMs % second === 0) {
        const seconds = windowMs / second;
        return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
    }

    return `${windowMs}ms`;
};

const formatRateLimitRule = (
    { pathPrefixes, methods = ['ALL'] }: RateLimitRule,
    stage: RateLimitStage,
    options: RateLimitOptions | AuthenticatedRateLimitOptions,
): string => {
    const { limit, windowMs } = options;
    const tokenKinds =
        stage === 'afterAuthentication'
            ? (options as AuthenticatedRateLimitOptions).tokenKinds
            : undefined;
    const tokenKindScope = tokenKinds ? ` (${tokenKinds.join(', ')})` : '';
    return `Configured ${stage} rate limit: ${methods.join(',')} ${pathPrefixes?.join(', ') ?? '*'}${tokenKindScope} — ${limit} requests per ${formatWindow(windowMs)}`;
};

const createRateLimitRules = (config: IUnleashConfig): RateLimitRule[] => {
    const perMinute = { windowMs: minutesToMilliseconds(1) };
    const perSecond = { windowMs: secondsToMilliseconds(1) };
    const supportedSdkApiPaths = ['/api/client', '/api/frontend'];
    const deprecatedProxyApiPaths = [
        '/api/proxy',
        '/api/development/proxy',
        '/api/production/proxy',
    ];

    return [
        {
            afterAuthentication: {
                tokenKinds: [AuthorizationTokenKind.ACCOUNT_ACCESS],
                ...perMinute,
                limit: config.rateLimiting.tokenAuthenticationMaxPerMinute,
            },
        },
        {
            pathPrefixes: supportedSdkApiPaths,
            afterAuthentication: {
                tokenKinds: [AuthorizationTokenKind.API_TOKEN],
                ...perMinute,
                limit: config.rateLimiting.tokenAuthenticationMaxPerMinute,
            },
        },
        {
            pathPrefixes: deprecatedProxyApiPaths,
            afterAuthentication: {
                tokenKinds: [AuthorizationTokenKind.API_TOKEN],
                ...perMinute,
                limit: config.rateLimiting.tokenAuthenticationMaxPerMinute,
            },
        },
        {
            pathPrefixes: supportedSdkApiPaths,
            afterAuthentication: {
                ...perMinute,
                limit: config.rateLimiting.sdkApiMaxPerMinute,
            },
        },
        {
            pathPrefixes: deprecatedProxyApiPaths,
            afterAuthentication: {
                ...perMinute,
                limit: config.rateLimiting.sdkApiMaxPerMinute,
            },
        },
        {
            pathPrefixes: ['/auth/simple'],
            beforeAuthentication: {
                ...perMinute,
                limit: config.isEnterprise
                    ? config.rateLimiting.authenticationMaxPerMinute
                    : config.rateLimiting.simpleLoginMaxPerMinute,
            },
        },
        {
            pathPrefixes: ['/auth/saml'],
            beforeAuthentication: {
                ...perMinute,
                limit: config.rateLimiting.authenticationMaxPerMinute,
            },
        },
        {
            pathPrefixes: ['/auth/oidc'],
            beforeAuthentication: {
                ...perMinute,
                limit: config.rateLimiting.authenticationMaxPerMinute,
            },
        },
        {
            pathPrefixes: ['/auth/reset/password-email'],
            methods: ['POST'],
            beforeAuthentication: {
                ...perMinute,
                limit: config.rateLimiting.passwordResetMaxPerMinute,
            },
        },
        {
            pathPrefixes: ['/api/admin/user-admin'],
            methods: ['POST'],
            afterAuthentication: {
                ...perMinute,
                limit: config.rateLimiting.createUserMaxPerMinute,
            },
        },
        {
            pathPrefixes: ['/api/client/metrics'],
            methods: ['POST'],
            afterAuthentication: {
                ...perMinute,
                limit: config.metricsRateLimiting.clientMetricsMaxPerMinute,
            },
        },
        {
            pathPrefixes: ['/api/client/register'],
            methods: ['POST'],
            afterAuthentication: {
                ...perMinute,
                limit: config.metricsRateLimiting.clientRegisterMaxPerMinute,
            },
        },
        {
            pathPrefixes: ['/api/frontend/client/metrics'],
            methods: ['POST'],
            afterAuthentication: {
                ...perMinute,
                limit: config.metricsRateLimiting.frontendMetricsMaxPerMinute,
            },
        },
        {
            pathPrefixes: ['/api/frontend/client/register'],
            methods: ['POST'],
            afterAuthentication: {
                ...perMinute,
                limit: config.metricsRateLimiting.frontendRegisterMaxPerMinute,
            },
        },
        {
            pathPrefixes: ['/api/signal-endpoint'],
            afterAuthentication: {
                ...perSecond,
                limit: config.rateLimiting.callSignalEndpointMaxPerSecond,
            },
        },
    ];
};

const matchesRule = (
    rule: RateLimitRule,
    request: Request,
    stage: RateLimitStage,
): boolean => {
    const options = rule[stage];
    if (!options) {
        return false;
    }

    if (rule.methods && !rule.methods.includes(request.method)) {
        return false;
    }

    const matchesPath =
        !rule.pathPrefixes ||
        rule.pathPrefixes.some(
            (pathPrefix) =>
                request.path === pathPrefix ||
                (request.path.startsWith(pathPrefix) &&
                    request.path[pathPrefix.length] === '/'),
        );
    if (!matchesPath) {
        return false;
    }

    const tokenKinds =
        stage === 'afterAuthentication'
            ? (options as AuthenticatedRateLimitOptions).tokenKinds
            : undefined;
    if (!tokenKinds) {
        return true;
    }

    const tokenKind = parseAuthorizationToken(
        request.header('authorization'),
    )?.kind;
    return Boolean(tokenKind && tokenKinds.includes(tokenKind));
};

export const getMatchingRateLimitOptions = (
    config: IUnleashConfig,
    request: Request,
    stage: RateLimitStage,
): RateLimitOptions[] =>
    createRateLimitRules(config)
        .filter((rule) => matchesRule(rule, request, stage))
        .flatMap((rule) => {
            const options = rule[stage];
            return options
                ? [{ windowMs: options.windowMs, limit: options.limit }]
                : [];
        });

export const createRateLimitMiddleware = (
    config: IUnleashConfig,
    stage: RateLimitStage,
): RequestHandler => {
    const rules = createRateLimitRules(config).filter((rule) => rule[stage]);
    const logger = config.getLogger('/middleware/rate-limit-middleware.ts');
    rules.forEach((rule) => {
        logger.debug(formatRateLimitRule(rule, stage, rule[stage]!));
    });
    const limiters = new Map(
        rules.map((rule) => {
            const { windowMs, limit } = rule[stage]!;
            return [
                rule,
                rateLimit({
                    windowMs,
                    limit,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ] as const;
        }),
    );

    return (request, response, next) => {
        const matchingLimiters = rules.flatMap((rule) => {
            if (!matchesRule(rule, request, stage)) {
                return [];
            }
            const limiter = limiters.get(rule);
            return limiter ? [limiter] : [];
        });

        const applyNextLimiter = (index: number): void => {
            const limiter = matchingLimiters[index];
            if (!limiter) {
                next();
                return;
            }
            limiter(request, response, () => applyNextLimiter(index + 1));
        };

        applyNextLimiter(0);
    };
};
