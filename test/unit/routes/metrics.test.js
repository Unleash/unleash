'use strict';

const test = require('ava');
const store = require('./fixtures/store');
const supertest = require('supertest');
const logger = require('../../../lib/logger');
const getApp = require('../../../lib/app');

test.beforeEach(() =>  {
    logger.setLevel('FATAL');
});

function getSetup () {
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: '',
        stores,
    });

    return {
        request: supertest(app),
    };
}

test('should register client', () => {
    const { request } = getSetup();
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(202);
});

test('should require appName field', () => {
    const { request } = getSetup();
    return request
        .post('/api/client/register')
        .expect(400);
});

test('should require strategies field', () => {
    const { request } = getSetup();
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            // strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(400);
});


test('should accept client metrics', () => {
    const { request } = getSetup();
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {},
            },
        })
        .expect(202);
});
