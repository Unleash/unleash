'use strict';

const { test } = require('ava');
const express = require('express');
const proxyquire = require('proxyquire');
const getApp = proxyquire('./app', {
    './routes': {
        router: () => express.Router(),
    },
});

test('should not throw when valid config', t => {
    const app = getApp({});
    t.true(typeof app.listen === 'function');
});

test('should call preHook', t => {
    let called = 0;
    getApp({
        preHook: () => {
            called++;
        },
    });
    t.true(called === 1);
});

test('should call preRouterHook', t => {
    let called = 0;
    getApp({
        preRouterHook: () => {
            called++;
        },
    });
    t.true(called === 1);
});
