'use strict';

const test = require('ava');
const store = require('./../../../test/fixtures/store');
const getLogger = require('../../../test/fixtures/no-logger');
const supertest = require('supertest');
const getApp = require('../../app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

function getSetup() {
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: '',
        stores,
        eventBus,
        getLogger,
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

test('should fail if store fails', t => {
    t.plan(0);

    // --- start custom config
    const stores = store.createStores();
    stores.clientApplicationsStore = {
        upsert: () => {
            throw new Error('opps');
        },
    };

    const app = getApp({
        baseUriPath: '',
        stores,
        eventBus,
        getLogger,
    });
    // --- end custom config

    const request = supertest(app);

    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(500);
});
