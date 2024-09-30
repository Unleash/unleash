import { originMiddleware } from './origin-middleware';
import type { IUnleashConfig } from '../types';
import { createTestConfig } from '../../test/config/test-config';
import type { Request, Response } from 'express';
import { EventEmitter } from 'events';
import { REQUEST_ORIGIN } from '../metric-events';

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
    const eventBus = new EventEmitter();
    eventBus.emit = jest.fn();

    let config: IUnleashConfig;

    beforeEach(() => {
        config = {
            ...createTestConfig({
                getLogger,
                experimental: {
                    flags: {
                        originMiddleware: true,
                    },
                },
            }),
            eventBus,
        };
    });

    it('should call next', () => {
        const middleware = originMiddleware(config);

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should emit UI request origin event', () => {
        const middleware = originMiddleware(config);

        middleware(req, res, next);

        expect(eventBus.emit).toHaveBeenCalledWith(REQUEST_ORIGIN, {
            type: 'UI',
            method: req.method,
        });
    });

    it('should emit API request origin event', () => {
        const middleware = originMiddleware(config);

        req.headers.authorization = TEST_UNLEASH_TOKEN;
        req.headers['user-agent'] = TEST_USER_AGENT;

        middleware(req, res, next);

        expect(eventBus.emit).toHaveBeenCalledWith(REQUEST_ORIGIN, {
            type: 'API',
            method: req.method,
            source: 'Other',
        });
    });

    it('should log API request', () => {
        const middleware = originMiddleware(config);

        req.headers.authorization = TEST_UNLEASH_TOKEN;
        req.headers['user-agent'] = TEST_USER_AGENT;

        middleware(req, res, next);

        expect(loggerMock.info).toHaveBeenCalledWith('API request', {
            method: req.method,
            userAgent: TEST_USER_AGENT,
            origin: undefined,
        });
    });
});
