import express from 'express';
import { createTestConfig } from '../test/config/test-config.js';
import compression from 'compression';
import { jest } from '@jest/globals';

jest.mock('compression', () =>
    jest.fn().mockImplementation(() => (req, res, next) => {
        next();
    }),
);

jest.mock(
    './routes',
    () =>
        class Index {
            router() {
                return express.Router();
            }
        },
);

import getApp from './app.js';
test('should not throw when valid config', async () => {
    const config = createTestConfig();
    // @ts-expect-error - We're passing in empty stores and services
    const app = await getApp(config, {}, {});
    expect(typeof app.listen).toBe('function');
});

test('should call preHook', async () => {
    let called = 0;
    const config = createTestConfig({
        preHook: () => {
            called++;
        },
    });
    // @ts-expect-error - We're passing in empty stores and services
    await getApp(config, {}, {});
    expect(called).toBe(1);
});

test('should call preRouterHook', async () => {
    let called = 0;
    const config = createTestConfig({
        preRouterHook: () => {
            called++;
        },
    });
    // @ts-expect-error - We're passing in empty stores and services
    await getApp(config, {}, {});
    expect(called).toBe(1);
});

describe('compression middleware', () => {
    beforeAll(() => {
        (compression as jest.Mock).mockClear();
    });

    afterEach(() => {
        (compression as jest.Mock).mockClear();
    });

    test.each([
        {
            disableCompression: true,
            expectCompressionEnabled: false,
        },
        {
            disableCompression: false,
            expectCompressionEnabled: true,
        },
        {
            disableCompression: null,
            expectCompressionEnabled: true,
        },
        {
            disableCompression: undefined,
            expectCompressionEnabled: true,
        },
    ])(
        `should expect the compression middleware to be $expectCompressionEnabled when configInput.server.disableCompression is $disableCompression`,
        async ({ disableCompression, expectCompressionEnabled }) => {
            const config = createTestConfig({
                server: {
                    disableCompression: disableCompression as any,
                },
            });
            // @ts-expect-error - We're passing in empty stores and services
            await getApp(config, {}, {});
            expect(compression).toBeCalledTimes(+expectCompressionEnabled);
        },
    );
});
