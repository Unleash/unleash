'use strict';

const express = require('express');

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
const { createTestConfig } = require('../test/config/test-config');

test('should not throw when valid config', () => {
    const config = createTestConfig();
    const app = getApp(config, {}, {});
    expect(typeof app.listen === 'function').toBe(true);
});

test('should call preHook', () => {
    let called = 0;
    const config = createTestConfig({
        preHook: () => {
            called++;
        },
    });
    getApp(config, {}, {});
    expect(called === 1).toBe(true);
});

test('should call preRouterHook', () => {
    let called = 0;
    const config = createTestConfig({
        preRouterHook: () => {
            called++;
        },
    });
    getApp(config, {}, {});
    expect(called === 1).toBe(true);
});
