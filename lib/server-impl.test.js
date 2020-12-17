'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');
const { EventEmitter } = require('events');
const express = require('express');
const getLogger = require('../test/fixtures/no-logger');

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
    './options': {
        createOptions(o) {
            return o;
        },
    },
    '../migrator': function() {
        return Promise.resolve();
    },
});

test('should call preHook', async t => {
    let called = 0;
    await serverImpl.start({
        port: 0,
        getLogger,
        preHook: () => {
            called++;
        },
    });
    t.true(called === 1);
});

test('should call preRouterHook', async t => {
    let called = 0;
    await serverImpl.start({
        port: 0,
        getLogger,
        preRouterHook: () => {
            called++;
        },
    });
    t.true(called === 1);
});

test('should call eventHook', async t => {
    let called = 0;
    await serverImpl.start({
        port: 0,
        getLogger,
        eventHook: () => {
            called++;
        },
    });
    eventStore.emit('feature-created', {});
    t.true(called === 1);
});

test('should auto-create server on start()', async t => {
    const { server } = await serverImpl.start({
        port: 0,
        getLogger,
        start: true,
    });
    t.false(typeof server === 'undefined');
});

test('should not create a server using create()', async t => {
    const { server } = await serverImpl.create({
        port: 0,
        getLogger,
    });
    t.true(typeof server === 'undefined');
});

test('should shutdown the server when calling stop()', async t => {
    const { server, stop } = await serverImpl.start({
        port: 0,
        getLogger,
        start: true,
    });
    await stop();
    t.is(server.address(), null);
});
