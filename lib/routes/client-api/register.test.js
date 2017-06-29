'use strict';

const { test } = require('ava');
const store = require('./../../../test/fixtures/store');
const supertest = require('supertest');
const logger = require('../../logger');
const getApp = require('../../app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

test.beforeEach(() => {
    logger.setLevel('FATAL');
});

function getSetup() {
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: '',
        stores,
        eventBus,
    });

    return {
        request: supertest(app),
        stores,
    };
}

test('should register client', t => {
    t.plan(0);
    const { request } = getSetup();
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            strategies: ['default'],
            sdkVersion: 'unleash-client-test:1.2',
            started: Date.now(),
            interval: 10,
        })
        .expect(202);
});

test('should register client without sdkVersin', t => {
    t.plan(0);
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

test('should require appName field', t => {
    t.plan(0);
    const { request } = getSetup();
    return request.post('/api/client/register').expect(400);
});

test('should require strategies field', t => {
    t.plan(0);
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
