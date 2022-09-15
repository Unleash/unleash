import { EventEmitter } from 'events';
import express from 'express';
import { createTestConfig } from '../test/config/test-config';
import { start, create } from './server-impl';

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

const eventStore = new EventEmitter();
const settingStore = {
    get: () => {
        Promise.resolve('secret');
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

jest.mock('./db', () => ({
    createStores() {
        return {
            db: { destroy: () => undefined },
            clientInstanceStore: { destroy: noop },
            clientMetricsStore: { destroy: noop, on: noop },
            eventStore,
            publicSignupTokenStore: { destroy: noop, on: noop },
            settingStore,
        };
    },
}));

jest.mock('../migrator', () => ({
    migrateDb: () => Promise.resolve(),
}));

jest.mock(
    './util/version',
    () =>
        function () {
            return 'unleash-test-version';
        },
);

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

test('should call eventHook', async () => {
    let called = 0;
    const config = createTestConfig({
        server: { port: 0 },
        eventHook: () => {
            called++;
        },
    });
    const { stop } = await start(config);
    eventStore.emit('feature-created', {});
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
    expect(server.address()).toBe(null);
});
