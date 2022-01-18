import express from 'express';
import { createTestConfig } from '../test/config/test-config';

jest.mock(
    './routes',
    () =>
        class Index {
            router() {
                return express.Router();
            }
        },
);

const getApp = require('./app').default;

test('should not throw when valid config', async () => {
    const config = createTestConfig();
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
    await getApp(config, {}, {});
    expect(called).toBe(1);
});
