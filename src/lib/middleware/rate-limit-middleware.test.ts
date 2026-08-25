import { describe, expect, test } from 'vitest';
import { createTestConfig } from '../../test/config/test-config.js';
import { getRateLimitOptionsForRequest } from './rate-limit-middleware.js';
import type { Request } from 'express';

describe('rate limit policies', () => {
    test('uses the existing configurable limits', () => {
        const config = createTestConfig({
            rateLimiting: {
                createUserMaxPerMinute: 21,
                simpleLoginMaxPerMinute: 11,
                authenticationMaxPerMinute: 12,
                passwordResetMaxPerMinute: 2,
                callSignalEndpointMaxPerSecond: 3,
            },
            metricsRateLimiting: {
                clientMetricsMaxPerMinute: 101,
                clientRegisterMaxPerMinute: 102,
                frontendMetricsMaxPerMinute: 103,
                frontendRegisterMaxPerMinute: 104,
            },
        });

        expect(beforeAuthentication(config, request('/auth/simple'))).toEqual({
            windowMs: 60_000,
            limit: 11,
        });
        expect(
            beforeAuthentication(
                createTestConfig({
                    enterpriseVersion: 'test',
                    rateLimiting: {
                        authenticationMaxPerMinute: 12,
                    },
                }),
                request('/auth/simple'),
            ),
        ).toEqual({ windowMs: 60_000, limit: 12 });
        expect(
            beforeAuthentication(config, request('/auth/reset/password-email')),
        ).toEqual({ windowMs: 60_000, limit: 2 });
        expect(
            afterAuthentication(config, request('/api/admin/user-admin')),
        ).toEqual({ windowMs: 60_000, limit: 21 });
        expect(
            afterAuthentication(config, request('/api/client/metrics')),
        ).toEqual({ windowMs: 60_000, limit: 101 });
        expect(
            afterAuthentication(config, request('/api/client/register')),
        ).toEqual({ windowMs: 60_000, limit: 102 });
        expect(
            afterAuthentication(
                config,
                request('/api/frontend/client/metrics'),
            ),
        ).toEqual({ windowMs: 60_000, limit: 103 });
        expect(
            afterAuthentication(
                config,
                request('/api/frontend/client/register'),
            ),
        ).toEqual({ windowMs: 60_000, limit: 104 });
        expect(
            afterAuthentication(config, request('/api/signal-endpoint')),
        ).toEqual({ windowMs: 1_000, limit: 3 });
    });

    test('matches a path prefix only when the method matches', () => {
        const config = createTestConfig();
        const clientMetricsRequest = {
            method: 'POST',
            path: '/api/client/metrics',
        } as Request;

        expect(afterAuthentication(config, clientMetricsRequest)).toEqual({
            windowMs: 60_000,
            limit: 6000,
        });
        expect(
            afterAuthentication(config, {
                ...clientMetricsRequest,
                method: 'GET',
            } as Request),
        ).toBeUndefined();
        expect(
            afterAuthentication(config, request('/api/client/metrics-extra')),
        ).toBeUndefined();
        expect(
            afterAuthentication(config, request('/api/client/metrics/bulk')),
        ).toEqual({ windowMs: 60_000, limit: 6000 });
    });

    test('matches mounted router paths', () => {
        expect(
            afterAuthentication(createTestConfig(), {
                method: 'POST',
                path: '/api/signal-endpoint/example',
            } as Request),
        ).toEqual({ windowMs: 1_000, limit: 1 });
    });

    test('keeps limits in their declared authentication stage', () => {
        const config = createTestConfig();

        expect(beforeAuthentication(config, request('/auth/simple'))).toEqual({
            windowMs: 60_000,
            limit: 10,
        });
        expect(
            afterAuthentication(config, request('/auth/simple')),
        ).toBeUndefined();
        expect(
            beforeAuthentication(config, request('/api/client/metrics')),
        ).toBeUndefined();
        expect(
            afterAuthentication(config, request('/api/client/metrics')),
        ).toEqual({ windowMs: 60_000, limit: 6000 });
    });
});

const request = (path: string, method = 'POST'): Request =>
    ({ method, path }) as Request;

const beforeAuthentication = (
    config: ReturnType<typeof createTestConfig>,
    req: Request,
) => getRateLimitOptionsForRequest(config, req, 'beforeAuthentication');

const afterAuthentication = (
    config: ReturnType<typeof createTestConfig>,
    req: Request,
) => getRateLimitOptionsForRequest(config, req, 'afterAuthentication');
