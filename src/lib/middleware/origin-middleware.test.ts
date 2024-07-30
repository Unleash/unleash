import { originMiddleware } from './origin-middleware';
import type { IUnleashConfig } from '../types';
import { createTestConfig } from '../../test/config/test-config';
import type { Request, Response } from 'express';

const TEST_UNLEASH_TOKEN = 'TEST_UNLEASH_TOKEN';
const TEST_USER_AGENT = 'TEST_USER_AGENT';

describe('originMiddleware', () => {
    const req = { headers: {}, path: '' } as Request;
    const res = {} as Response;
    const next = jest.fn();
    const loggerMock = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
    };
    const getLogger = jest.fn(() => loggerMock);

    let config: IUnleashConfig;

    beforeEach(() => {
        config = createTestConfig({
            getLogger,
            experimental: {
                flags: {
                    originMiddleware: true,
                },
            },
        });
    });

    it('should call next', () => {
        const middleware = originMiddleware(config);

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should log UI request', () => {
        const middleware = originMiddleware(config);

        middleware(req, res, next);

        expect(loggerMock.debug).toHaveBeenCalledWith('UI request', {
            method: req.method,
        });
    });

    it('should log API request', () => {
        const middleware = originMiddleware(config);

        req.headers.authorization = TEST_UNLEASH_TOKEN;
        req.headers['user-agent'] = TEST_USER_AGENT;

        middleware(req, res, next);

        expect(loggerMock.debug).toHaveBeenCalledWith('API request', {
            method: req.method,
            userAgent: TEST_USER_AGENT,
        });
    });
});
