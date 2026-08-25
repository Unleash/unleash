import type { Request, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { minutesToMilliseconds, secondsToMilliseconds } from 'date-fns';
import type { IUnleashConfig } from '../types/option.js';

type RateLimitOptions = {
    windowMs: number;
    limit: number;
};

export type RateLimitStage = 'beforeAuthentication' | 'afterAuthentication';

type RateLimitRule = {
    pathPrefixes: string[];
    methods?: string[];
    beforeAuthentication?: RateLimitOptions;
    afterAuthentication?: RateLimitOptions;
};

const createRateLimitRules = (config: IUnleashConfig): RateLimitRule[] => {
    const perMinute = { windowMs: minutesToMilliseconds(1) };
    const perSecond = { windowMs: secondsToMilliseconds(1) };

    return [
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
    if (!rule[stage]) {
        return false;
    }

    if (rule.methods && !rule.methods.includes(request.method)) {
        return false;
    }

    return rule.pathPrefixes.some(
        (pathPrefix) =>
            request.path === pathPrefix ||
            (request.path.startsWith(pathPrefix) &&
                request.path[pathPrefix.length] === '/'),
    );
};

export const getRateLimitOptionsForRequest = (
    config: IUnleashConfig,
    request: Request,
    stage: RateLimitStage,
): RateLimitOptions | undefined =>
    createRateLimitRules(config).find((rule) =>
        matchesRule(rule, request, stage),
    )?.[stage];

export const createRateLimitMiddleware = (
    config: IUnleashConfig,
    stage: RateLimitStage,
): RequestHandler => {
    const rules = createRateLimitRules(config).filter((rule) => rule[stage]);
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
        const rule = rules.find((rule) => matchesRule(rule, request, stage));
        const limiter = rule && limiters.get(rule);
        return limiter ? limiter(request, response, next) : next();
    };
};
