'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');

const getApp = proxyquire('./app', {
    './routes': {
        createAPI: () => {},
        createLegacy: () => {},
    },
});

const serverImpl = proxyquire('./server-impl', {
    './app': getApp,
    './metrics': {
        startMonitoring (o) {
            return o;
        },
    },
    './db': {
        createStores (o) {
            return o;
        },
    },
    './options': {
        createOptions (o) {
            return o;
        },
    },
    '../migrator' () {
        return Promise.resolve();
    },
});

test('should call preHook', async t => {
    let called = 0;
    await serverImpl.start({
        preHook: () => {
            called++;
        },
    });
    t.true(called === 1);
});

test('should call preRouterHook', async t => {
    let called = 0;
    await serverImpl.start({ preRouterHook: () => {
        called++;
    } });
    t.true(called === 1);
});
