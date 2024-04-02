import { bearerTokenMiddleware } from './bearer-token-middleware';
import type { IUnleashConfig } from '../types';
import { createTestConfig } from '../../test/config/test-config';
import getLogger from '../../test/fixtures/no-logger';
import type { Request, Response } from 'express';

const exampleSignalToken = 'signal_tokensecret';

describe('bearerTokenMiddleware', () => {
    const req = { headers: {}, path: '' } as Request;
    const res = {} as Response;
    const next = jest.fn();

    let config: IUnleashConfig;

    beforeEach(() => {
        config = createTestConfig({
            getLogger,
            experimental: {
                flags: {
                    bearerTokenMiddleware: true,
                },
            },
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
});
