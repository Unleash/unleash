'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const { createTestConfig } = require('../../../test/config/test-config');
const store = require('../../../test/fixtures/store');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');
const { createServices } = require('../../services');

const eventBus = new EventEmitter();

function getSetup() {
    const stores = store.createStores();
    const config = createTestConfig();
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        request: supertest(app),
        stores,
        destroy: () => {
            services.versionService.destroy();
            services.clientMetricsService.destroy();
            services.apiTokenService.destroy();
        },
    };
}
let request;
let destroy;
beforeEach(() => {
    const setup = getSetup();
    request = setup.request;
    destroy = setup.destroy;
});
afterEach(() => {
    destroy();
    getLogger.setMuteError(false);
});

test('should register client', () => {
    expect.assertions(0);
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

test('should register client without sdkVersion', () => {
    expect.assertions(0);
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
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should require strategies field', () => {
    expect.assertions(0);
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
