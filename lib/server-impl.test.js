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

const eventStore = new EventEmitter();
const settingStore = {
    get: () => {
        Promise.resolve('secret');
    },
};

const serverImpl = proxyquire('./server-impl', {
    './app': getApp,
    './metrics': {
        startMonitoring(o) {
            return o;
        },
    },
    './db': {
        createStores() {
            return {
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
    '../migrator'() {
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
