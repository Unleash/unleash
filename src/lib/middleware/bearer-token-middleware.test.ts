import { bearerTokenMiddleware } from './bearer-token-middleware.js';
import type { IUnleashConfig } from '../types/index.js';
import { createTestConfig } from '../../test/config/test-config.js';
import getLogger from '../../test/fixtures/no-logger.js';
import type { Request, Response } from 'express';
import { vi } from 'vitest';

const exampleSignalToken = 'signal_tokensecret';

describe('bearerTokenMiddleware', () => {
    const req = { headers: {}, path: '' } as Request;
    const res = {} as Response;
    const next = vi.fn();

    let config: IUnleashConfig;

    beforeEach(() => {
        config = createTestConfig({
            getLogger,
        });
    });

    it('should call next', () => {
        const middleware = bearerTokenMiddleware(config);

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should leave Unleash tokens intact', () => {
        const middleware = bearerTokenMiddleware(config);

        req.headers = { authorization: exampleSignalToken };

        middleware(req, res, next);

        expect(req.headers.authorization).toBe(exampleSignalToken);
    });

    it('should convert Bearer token to Unleash token', () => {
        const middleware = bearerTokenMiddleware(config);

        const bearerToken = `Bearer ${exampleSignalToken}`;
        req.headers = { authorization: bearerToken };

        middleware(req, res, next);

        expect(req.headers.authorization).toBe(exampleSignalToken);
    });

    it('should be case insensitive in the scheme', () => {
        const middleware = bearerTokenMiddleware(config);

        const bearerToken = `bEaReR ${exampleSignalToken}`;
        req.headers = { authorization: bearerToken };

        middleware(req, res, next);

        expect(req.headers.authorization).toBe(exampleSignalToken);
    });

    it('should always run for signal endpoint, without base path', () => {
        const configWithBearerTokenMiddlewareFlagDisabled = createTestConfig({
            getLogger,
        });

        const middleware = bearerTokenMiddleware(
            configWithBearerTokenMiddlewareFlagDisabled,
        );

        req.path = '/api/signal-endpoint/';

        const bearerToken = `Bearer ${exampleSignalToken}`;
        req.headers = { authorization: bearerToken };

        middleware(req, res, next);

        expect(req.headers.authorization).toBe(exampleSignalToken);
    });

    it('should always run for signal endpoint, regardless of the flag, with base path', () => {
        const configWithBearerTokenMiddlewareFlagDisabled = createTestConfig({
            getLogger,
            server: {
                baseUriPath: '/some-test-instance',
            },
        });

        const middleware = bearerTokenMiddleware(
            configWithBearerTokenMiddlewareFlagDisabled,
        );

        req.path = '/some-test-instance/api/signal-endpoint/';

        const bearerToken = `Bearer ${exampleSignalToken}`;
        req.headers = { authorization: bearerToken };

        middleware(req, res, next);

        expect(req.headers.authorization).toBe(exampleSignalToken);
    });
});
