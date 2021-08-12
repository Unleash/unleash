'use strict';

const { EventEmitter } = require('events');
const express = require('express');
const { createTestConfig } = require('../test/config/test-config');

jest.mock(
    './routes',
    () =>
        class Index {
            router() {
                return express.Router();
            }
        },
);

const getApp = require('./app');

const noop = () => {};

const eventStore = new EventEmitter();
const settingStore = {
    get: () => {
        Promise.resolve('secret');
    },
};

jest.mock('./app', () => getApp);

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
            settingStore,
        };
    },
}));

jest.mock(
    '../migrator',
    () =>
        function () {
            return Promise.resolve();
        },
);

jest.mock(
    './util/version',
    () =>
        function () {
            return 'unleash-test-version';
        },
);

const serverImpl = require('./server-impl');

test('should call preHook', async () => {
    let called = 0;
    const config = createTestConfig({
        server: { port: 0 },
        preHook: () => {
            called++;
        },
    });
    await serverImpl.start(config);
    expect(called).toBe(1);
});

test('should call preRouterHook', async () => {
    let called = 0;
    await serverImpl.start(
        createTestConfig({
            server: { port: 0 },
            preRouterHook: () => {
                called++;
            },
        }),
    );
    expect(called === 1).toBe(true);
});

test('should call eventHook', async () => {
    let called = 0;
    const config = createTestConfig({
        server: { port: 0 },
        eventHook: () => {
            called++;
        },
    });
    await serverImpl.start(config);
    eventStore.emit('feature-created', {});
    expect(called === 1).toBe(true);
});

test('should auto-create server on start()', async () => {
    const { server } = await serverImpl.start(
        createTestConfig({ server: { port: 0 } }),
    );
    expect(typeof server === 'undefined').toBe(false);
});

test('should not create a server using create()', async () => {
    const config = createTestConfig({ server: { port: 0 } });
    const { server } = await serverImpl.create(config);
    expect(server).toBeUndefined();
});

test('should shutdown the server when calling stop()', async () => {
    const { server, stop } = await serverImpl.start(
        createTestConfig({ server: { port: 0 } }),
    );
    await stop();
    expect(server.address()).toBe(null);
});
