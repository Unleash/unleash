'use strict';

const test = require('ava');
const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');
const { createServices } = require('../../services');

const eventBus = new EventEmitter();

function getSetup() {
    const stores = store.createStores();
    const config = {
        baseUriPath: '',
        stores,
        eventBus,
        getLogger,
    };
    const services = createServices(stores, config);
    const app = getApp(config, services);

    return {
        request: supertest(app),
        stores,
    };
}

test.afterEach(() => {
    getLogger.setMuteError(false);
});

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
    getLogger.setMuteError(true);

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
