'use strict';

const test = require('ava');
const express = require('express');
const proxyquire = require('proxyquire');
const getLogger = require('../test/fixtures/no-logger');
const getApp = proxyquire('./app', {
    './routes': class Index {
        router() {
            return express.Router();
        }
    },
});

test('should not throw when valid config', t => {
    const app = getApp({ getLogger });
    t.true(typeof app.listen === 'function');
});

test('should call preHook', t => {
    let called = 0;
    getApp({
        getLogger,
        preHook: () => {
            called++;
        },
    });
    t.true(called === 1);
});

test('should call preRouterHook', t => {
    let called = 0;
    getApp({
        getLogger,
        preRouterHook: () => {
            called++;
        },
    });
    t.true(called === 1);
});
