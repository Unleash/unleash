'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../test/fixtures/store');
const getApp = require('../app');
const { createServices } = require('../services');
const { createTestConfig } = require('../../test/config/test-config');

const eventBus = new EventEmitter();

test('should use enable prometheus', () => {
    expect.assertions(0);
    const stores = store.createStores();
    const config = createTestConfig();
    const app = getApp(
        config,
        stores,
        createServices(stores, config),
        eventBus,
    );

    const request = supertest(app);

    return request
        .get('/internal-backstage/prometheus')
        .expect('Content-Type', /text/)
        .expect(200);
});
