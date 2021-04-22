'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const getApp = require('../../app');
const { createServices } = require('../../services');
const { createTestConfig } = require('../../../test/config/test-config');

const eventBus = new EventEmitter();

const uiConfig = {
    headerBackground: 'red',
    slogan: 'hello',
};

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const config = createTestConfig({
        server: { baseUriPath: base },
        ui: uiConfig,
    });
    const stores = store.createStores();
    const app = getApp(
        config,
        stores,
        createServices(stores, config),
        eventBus,
    );

    return {
        base,
        request: supertest(app),
    };
}

test('should get ui config', () => {
    expect.assertions(2);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/ui-config`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.slogan === 'hello').toBe(true);
            expect(res.body.headerBackground === 'red').toBe(true);
        });
});
