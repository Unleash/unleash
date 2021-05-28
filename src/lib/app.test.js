'use strict';

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

test('should not throw when valid config', () => {
    const config = createTestConfig();
    const app = getApp(config, {}, {});
    expect(typeof app.listen).toBe('function');
});

test('should call preHook', () => {
    let called = 0;
    const config = createTestConfig({
        preHook: () => {
            called++;
        },
    });
    getApp(config, {}, {});
    expect(called).toBe(1);
});

test('should call preRouterHook', () => {
    let called = 0;
    const config = createTestConfig({
        preRouterHook: () => {
            called++;
        },
    });
    getApp(config, {}, {});
    expect(called).toBe(1);
});
