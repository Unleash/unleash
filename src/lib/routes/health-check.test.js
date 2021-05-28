'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const { createServices } = require('../services');
const { createTestConfig } = require('../../test/config/test-config');

const store = require('../../test/fixtures/store');
const getLogger = require('../../test/fixtures/no-logger');
const getApp = require('../app');

const eventBus = new EventEmitter();

function getSetup() {
    const stores = store.createStores();
    const { db } = stores;
    const config = createTestConfig();
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        db,
        request: supertest(app),
        destroy: () => {
            services.versionService.destroy();
            services.clientMetricsService.destroy();
            services.apiTokenService.destroy();
        },
    };
}
let request;
let db;
let destroy;
beforeEach(() => {
    const setup = getSetup();
    request = setup.request;
    db = setup.db;
    destroy = setup.destroy;
});

afterEach(() => {
    destroy();
    getLogger.setMuteError(false);
});

test('should give 500 when db is failing', () => {
    getLogger.setMuteError(true);
    expect.assertions(2);
    db.raw = () => Promise.reject(new Error('db error'));
    return request
        .get('/health')
        .expect(500)
        .expect(res => {
            expect(res.status).toBe(500);
            expect(res.body.health).toBe('BAD');
        });
});

test('should give 200 when db is not failing', () => {
    expect.assertions(0);
    db.raw = () => Promise.resolve();
    return request.get('/health').expect(200);
});

test('should give health=GOOD when db is not failing', () => {
    expect.assertions(2);
    db.raw = () => Promise.resolve();
    return request
        .get('/health')
        .expect(200)
        .expect(res => {
            expect(res.status).toBe(200);
            expect(res.body.health).toBe('GOOD');
        });
});
