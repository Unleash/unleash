'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const { createServices } = require('../services');
const { createTestConfig } = require('../../test/config/test-config');

const store = require('../../test/fixtures/store');
const getApp = require('../app');

const eventBus = new EventEmitter();

test('should enable prometheus', async () => {
    expect.assertions(0);
    const stores = store.createStores();
    const config = createTestConfig();
    const services = createServices(stores, config);

    const app = getApp(config, stores, services, eventBus);

    const request = supertest(app);

    await request
        .get('/internal-backstage/prometheus')
        .expect('Content-Type', /text/)
        .expect(200);
    services.versionService.destroy();
    services.clientMetricsService.destroy();
    services.apiTokenService.destroy();
});
