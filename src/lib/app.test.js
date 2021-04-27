'use strict';

import { createTestConfig } from '../test/config/test-config';

const test = require('ava');
const express = require('express');
const proxyquire = require('proxyquire');

const getApp = proxyquire('./app', {
    './routes': class Index {
        router() {
            return express.Router();
        }
    },
});

test('should not throw when valid config', t => {
    const config = createTestConfig();
    const app = getApp(config, {}, {});
    t.true(typeof app.listen === 'function');
});

test('should call preHook', t => {
    let called = 0;
    const config = createTestConfig({
        preHook: () => {
            called++;
        },
    });
    getApp(config, {}, {});
    t.true(called === 1);
});

test('should call preRouterHook', t => {
    let called = 0;
    const config = createTestConfig({
        preRouterHook: () => {
            called++;
        },
    });
    getApp(config, {}, {});
    t.true(called === 1);
});
