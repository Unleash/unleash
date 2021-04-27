'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');
const { EventEmitter } = require('events');
const express = require('express');
const { createTestConfig } = require('../test/config/test-config');

const getApp = proxyquire('./app', {
    './routes': class Index {
        router() {
            return express.Router();
        }
    },
});

const noop = () => {};

const eventStore = new EventEmitter();
const settingStore = {
    get: () => {
        Promise.resolve('secret');
    },
};

const serverImpl = proxyquire('./server-impl', {
    './app': getApp,
    './metrics': {
        createMetricsMonitor() {
            return {
                startMonitoring: noop,
                stopMonitoring: noop,
            };
        },
    },
    './db': {
        createStores() {
            return {
                db: { destroy: cb => cb() },
                clientInstanceStore: { destroy: noop },
                clientMetricsStore: { destroy: noop, on: noop },
                eventStore,
                settingStore,
            };
        },
    },
    '../migrator': function() {
        return Promise.resolve();
    },
    './util/version': function() {
        return 'unleash-test-version';
    },
});

test('should call preHook', async t => {
    let called = 0;
    const config = createTestConfig({
        server: { port: 0 },
        preHook: () => {
            called++;
        },
    });
    await serverImpl.start(config);
    t.true(called === 1);
});

test('should call preRouterHook', async t => {
    let called = 0;
    await serverImpl.start(
        createTestConfig({
            server: { port: 0 },
            preRouterHook: () => {
                called++;
            },
        }),
    );
    t.true(called === 1);
});

test('should call eventHook', async t => {
    let called = 0;
    const config = createTestConfig({
        server: { port: 0 },
        eventHook: () => {
            called++;
        },
    });
    await serverImpl.start(config);
    eventStore.emit('feature-created', {});
    t.true(called === 1);
});

test('should auto-create server on start()', async t => {
    const { server } = await serverImpl.start(
        createTestConfig({ server: { port: 0 } }),
    );
    t.false(typeof server === 'undefined');
});

test('should not create a server using create()', async t => {
    const config = createTestConfig({ server: { port: 0 } });
    const { server } = await serverImpl.create(config);
    t.true(typeof server === 'undefined');
});

test('should shutdown the server when calling stop()', async t => {
    const { server, stop } = await serverImpl.start(
        createTestConfig({ server: { port: 0 } }),
    );
    await stop();
    t.is(server.address(), null);
});
