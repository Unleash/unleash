import express from 'express';
import { createTestConfig } from '../test/config/test-config';
import { create, start } from './server-impl';

jest.mock(
    './routes',
    () =>
        class Index {
            router() {
                return express.Router();
            }
        },
);

const noop = () => {};

const settingStore = {
    get: () => {
        Promise.resolve('secret');
    },
    postgresVersion: () => {
        Promise.resolve('16.2');
    },
};

jest.mock('./metrics', () => ({
    createMetricsMonitor() {
        return {
            startMonitoring: noop,
            stopMonitoring: noop,
        };
    },
}));

jest.mock('./services', () => ({
    createServices() {
        return {
            featureLifecycleService: { listen() {} },
            schedulerService: { stop() {}, start() {} },
            addonService: { destroy() {} },
        };
    },
}));

jest.mock('./db', () => ({
    createStores() {
        return {
            settingStore,
        };
    },
}));

jest.mock('../migrator', () => ({
    migrateDb: () => Promise.resolve(),
}));

jest.mock('./util/db-lock', () => ({
    withDbLock: () => (fn) => fn,
}));

jest.mock('./util/version', () => () => 'unleash-test-version');

test('should call preHook', async () => {
    let called = 0;
    const config = createTestConfig({
        server: { port: 0 },
        preHook: () => {
            called++;
        },
    });
    const { stop } = await start(config);
    expect(called).toBe(1);
    await stop();
});

test('should call preRouterHook', async () => {
    let called = 0;
    const { stop } = await start(
        createTestConfig({
            server: { port: 0 },
            preRouterHook: () => {
                called++;
            },
        }),
    );
    expect(called === 1).toBe(true);
    await stop();
});

test('should auto-create server on start()', async () => {
    const { server, stop } = await start(
        createTestConfig({ server: { port: 0 } }),
    );
    expect(typeof server === 'undefined').toBe(false);
    await stop();
});

test('should not create a server using create()', async () => {
    const config = createTestConfig({ server: { port: 0 } });
    const { server, stop } = await create(config);
    expect(server).toBeUndefined();
    await stop();
});

test('should shutdown the server when calling stop()', async () => {
    const { server, stop } = await start(
        createTestConfig({ server: { port: 0 } }),
    );
    await stop();
    expect(server?.address()).toBe(null);
});
