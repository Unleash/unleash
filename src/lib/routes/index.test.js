'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../test/fixtures/store');
const getApp = require('../app');
const { createTestConfig } = require('../../test/config/test-config');
const { createServices } = require('../services');

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        base,
        request: supertest(app),
    };
}

test('api defintion', () => {
    expect.assertions(5);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body).toBeTruthy();
            const { admin, client } = res.body.links;
            expect(admin.uri === '/api/admin').toBe(true);
            expect(client.uri === '/api/client').toBe(true);
            expect(
                admin.links['feature-toggles'].uri === '/api/admin/features',
            ).toBe(true);
            expect(client.links.metrics.uri === '/api/client/metrics').toBe(
                true,
            );
        });
});

test('admin api defintion', () => {
    expect.assertions(2);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body).toBeTruthy();
            expect(
                res.body.links['feature-toggles'].uri === '/api/admin/features',
            ).toBe(true);
        });
});

test('client api defintion', () => {
    expect.assertions(2);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/client`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body).toBeTruthy();
            expect(res.body.links.metrics.uri === '/api/client/metrics').toBe(
                true,
            );
        });
});
