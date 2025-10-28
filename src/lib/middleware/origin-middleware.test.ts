import { originMiddleware } from './origin-middleware.js';
import type { IUnleashConfig } from '../types/index.js';
import { createTestConfig } from '../../test/config/test-config.js';
import type { Request, Response } from 'express';
import { EventEmitter } from 'events';
import { REQUEST_ORIGIN } from '../metric-events.js';
import { vi } from 'vitest';

const TEST_UNLEASH_TOKEN = 'TEST_UNLEASH_TOKEN';
const TEST_USER_AGENT = 'TEST_USER_AGENT';

describe('originMiddleware', () => {
    const req = { headers: {}, path: '' } as Request;
    const res = {} as Response;
    const next = vi.fn();
    const loggerMock = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
    };
    const getLogger = vi.fn(() => loggerMock);
    const eventBus = new EventEmitter();
    eventBus.emit = vi.fn() as () => boolean;

    let config: IUnleashConfig;

    beforeEach(() => {
        config = {
            ...createTestConfig({
                getLogger,
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
});
