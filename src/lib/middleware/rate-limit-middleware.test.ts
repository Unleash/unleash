import express from 'express';
import supertest from 'supertest';
import { describe, expect, test } from 'vitest';
import { createTestConfig } from '../../test/config/test-config.js';
import type { Request } from 'express';
import { AuthorizationTokenKind } from '../authentication/authorization-token.js';
import {
    createRateLimitMiddleware,
    getMatchingRateLimitOptions,
    type RateLimitStage,
} from './rate-limit-middleware.js';

describe('rate limit policies', () => {
    test('uses the existing configurable limits', () => {
        const config = createTestConfig({
            rateLimiting: {
                createUserMaxPerMinute: 21,
                simpleLoginMaxPerMinute: 11,
                authenticationMaxPerMinute: 12,
                passwordResetMaxPerMinute: 2,
                callSignalEndpointMaxPerSecond: 3,
                tokenAuthenticationMaxPerMinute: 105,
                sdkApiMaxPerMinute: 106,
            },
            metricsRateLimiting: {
                clientMetricsMaxPerMinute: 101,
                clientRegisterMaxPerMinute: 102,
                frontendMetricsMaxPerMinute: 103,
                frontendRegisterMaxPerMinute: 104,
            },
        });

        expect(
            matchingOptions(
                config,
                request('/auth/simple'),
                'beforeAuthentication',
            ),
        ).toEqual([{ windowMs: 60_000, limit: 11 }]);
        expect(
            matchingOptions(
                createTestConfig({
                    enterpriseVersion: 'test',
                    rateLimiting: {
                        authenticationMaxPerMinute: 12,
                    },
                }),
                request('/auth/simple'),
                'beforeAuthentication',
            ),
        ).toEqual([{ windowMs: 60_000, limit: 12 }]);
        expect(
            matchingOptions(
                config,
                request('/auth/reset/password-email'),
                'beforeAuthentication',
            ),
        ).toEqual([{ windowMs: 60_000, limit: 2 }]);
        expect(
            matchingOptions(
                config,
                request('/api/admin/user-admin'),
                'afterAuthentication',
            ),
        ).toEqual([{ windowMs: 60_000, limit: 21 }]);
        expect(
            matchingOptions(
                config,
                request('/api/client/metrics'),
                'afterAuthentication',
            ),
        ).toEqual([
            { windowMs: 60_000, limit: 106 },
            { windowMs: 60_000, limit: 101 },
        ]);
        expect(
            matchingOptions(
                config,
                request('/api/client/register'),
                'afterAuthentication',
            ),
        ).toEqual([
            { windowMs: 60_000, limit: 106 },
            { windowMs: 60_000, limit: 102 },
        ]);
        expect(
            matchingOptions(
                config,
                request('/api/frontend/client/metrics'),
                'afterAuthentication',
            ),
        ).toEqual([
            { windowMs: 60_000, limit: 106 },
            { windowMs: 60_000, limit: 103 },
        ]);
        expect(
            matchingOptions(
                config,
                request('/api/frontend/client/register'),
                'afterAuthentication',
            ),
        ).toEqual([
            { windowMs: 60_000, limit: 106 },
            { windowMs: 60_000, limit: 104 },
        ]);
        expect(
            matchingOptions(
                config,
                request('/api/signal-endpoint'),
                'afterAuthentication',
            ),
        ).toEqual([{ windowMs: 1_000, limit: 3 }]);
    });

    test('applies the client API baseline when route-specific rules do not match', () => {
        const config = createTestConfig();
        const clientMetricsRequest = request('/api/client/metrics');

        expect(
            matchingOptions(
                config,
                clientMetricsRequest,
                'afterAuthentication',
            ),
        ).toEqual([
            { windowMs: 60_000, limit: 20_000 },
            { windowMs: 60_000, limit: 6000 },
        ]);
        expect(
            matchingOptions(
                config,
                {
                    ...clientMetricsRequest,
                    method: 'GET',
                } as Request,
                'afterAuthentication',
            ),
        ).toEqual([{ windowMs: 60_000, limit: 20_000 }]);
        expect(
            matchingOptions(
                config,
                request('/api/client/metrics-extra'),
                'afterAuthentication',
            ),
        ).toEqual([{ windowMs: 60_000, limit: 20_000 }]);
        expect(
            matchingOptions(
                config,
                request('/api/client/metrics/bulk'),
                'afterAuthentication',
            ),
        ).toEqual([
            { windowMs: 60_000, limit: 20_000 },
            { windowMs: 60_000, limit: 6000 },
        ]);
    });

    test('matches mounted router paths', () => {
        expect(
            matchingOptions(
                createTestConfig(),
                request('/api/signal-endpoint/example'),
                'afterAuthentication',
            ),
        ).toEqual([{ windowMs: 1_000, limit: 1 }]);
    });

    test('matches authenticated token kinds on their allowed paths', () => {
        const config = createTestConfig({
            rateLimiting: {
                tokenAuthenticationMaxPerMinute: 105,
                sdkApiMaxPerMinute: 106,
            },
        });

        expect(
            matchingOptions(
                config,
                request(
                    '/api/client/features',
                    'GET',
                    AuthorizationTokenKind.API_TOKEN,
                ),
                'afterAuthentication',
            ),
        ).toEqual([
            { windowMs: 60_000, limit: 105 },
            { windowMs: 60_000, limit: 106 },
        ]);
        expect(
            matchingOptions(
                config,
                request('/api/client/features', 'GET'),
                'afterAuthentication',
            ),
        ).toEqual([{ windowMs: 60_000, limit: 106 }]);
        expect(
            matchingOptions(
                config,
                request(
                    '/api/frontend',
                    'GET',
                    AuthorizationTokenKind.ADMIN_API_TOKEN,
                ),
                'afterAuthentication',
            ),
        ).toEqual([{ windowMs: 60_000, limit: 106 }]);
        expect(
            matchingOptions(
                config,
                request(
                    '/api/admin/projects',
                    'GET',
                    AuthorizationTokenKind.API_TOKEN,
                ),
                'afterAuthentication',
            ),
        ).toEqual([]);
        expect(
            matchingOptions(
                config,
                request(
                    '/api/admin/projects',
                    'GET',
                    AuthorizationTokenKind.ACCOUNT_ACCESS,
                ),
                'afterAuthentication',
            ),
        ).toEqual([{ windowMs: 60_000, limit: 105 }]);
    });

    test('classifies the authorization header after authentication', () => {
        const config = createTestConfig({
            rateLimiting: {
                tokenAuthenticationMaxPerMinute: 105,
                sdkApiMaxPerMinute: 106,
            },
        });
        const req = request(
            '/api/client/features',
            'GET',
            AuthorizationTokenKind.API_TOKEN,
        );

        expect(matchingOptions(config, req, 'afterAuthentication')).toEqual([
            { windowMs: 60_000, limit: 105 },
            { windowMs: 60_000, limit: 106 },
        ]);
    });

    test('keeps before and after authentication limits in separate stages', () => {
        const config = createTestConfig();

        expect(
            matchingOptions(
                config,
                request('/auth/simple'),
                'beforeAuthentication',
            ),
        ).toHaveLength(1);
        expect(
            matchingOptions(
                config,
                request('/auth/simple'),
                'afterAuthentication',
            ),
        ).toEqual([]);
        expect(
            matchingOptions(
                config,
                request('/api/client/features', 'GET'),
                'beforeAuthentication',
            ),
        ).toEqual([]);
        expect(
            matchingOptions(
                config,
                request('/api/client/features', 'GET'),
                'afterAuthentication',
            ),
        ).toHaveLength(1);
    });

    test('composes token authentication with a route-specific limit', () => {
        const config = createTestConfig({
            rateLimiting: {
                tokenAuthenticationMaxPerMinute: 105,
                sdkApiMaxPerMinute: 106,
            },
            metricsRateLimiting: { clientMetricsMaxPerMinute: 101 },
        });

        expect(
            matchingOptions(
                config,
                request(
                    '/api/client/metrics',
                    'POST',
                    AuthorizationTokenKind.API_TOKEN,
                ),
                'afterAuthentication',
            ),
        ).toEqual([
            { windowMs: 60_000, limit: 105 },
            { windowMs: 60_000, limit: 106 },
            { windowMs: 60_000, limit: 101 },
        ]);
    });

    test.each([
        ['/api/proxy', '/api/client/features'],
        ['/api/proxy', '/api/frontend'],
        ['/api/client/features', '/api/proxy'],
        ['/api/frontend', '/api/proxy'],
    ])('keeps the rate-limit buckets for %s and %s independent', async (firstPath, secondPath) => {
        const config = createTestConfig({
            rateLimiting: {
                tokenAuthenticationMaxPerMinute: 1,
                sdkApiMaxPerMinute: 1,
            },
        });
        const app = express();
        app.use(createRateLimitMiddleware(config, 'afterAuthentication'));
        app.use((_req, res) => res.sendStatus(200));
        const agent = supertest(app);
        const authorization =
            authorizationValues[AuthorizationTokenKind.API_TOKEN];

        await agent
            .get(firstPath)
            .set('Authorization', authorization)
            .expect(200);
        await agent
            .get(secondPath)
            .set('Authorization', authorization)
            .expect(200);
        await agent
            .get(firstPath)
            .set('Authorization', authorization)
            .expect(429);
        await agent
            .get(secondPath)
            .set('Authorization', authorization)
            .expect(429);
    });
});

const request = (
    path: string,
    method = 'POST',
    tokenKind?: AuthorizationTokenKind,
): Request => {
    const authorization = tokenKind
        ? authorizationValues[tokenKind]
        : undefined;
    return {
        method,
        path,
        header: (name: string) =>
            name.toLowerCase() === 'authorization' ? authorization : undefined,
    } as unknown as Request;
};

const authorizationValues: Record<AuthorizationTokenKind, string> = {
    [AuthorizationTokenKind.ACCOUNT_ACCESS]: 'user:account-access-token',
    [AuthorizationTokenKind.API_TOKEN]: 'client:development.api-token',
    [AuthorizationTokenKind.ADMIN_API_TOKEN]: '*:*.admin-api-token',
};

const matchingOptions = (
    config: ReturnType<typeof createTestConfig>,
    req: Request,
    stage: RateLimitStage,
) => getMatchingRateLimitOptions(config, req, stage);
