'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const { createServices } = require('../../services');
const permissions = require('../../../test/fixtures/permissions');
const getApp = require('../../app');
const { createTestConfig } = require('../../../test/config/test-config');

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const perms = permissions();
    const config = createTestConfig({
        preHook: perms.hook,
        server: { baseUriPath: base },
    });

    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        base,
        request: supertest(app),
    };
}

test('should render html preview of template', () => {
    expect.assertions(0);
    const { request, base } = getSetup();
    return request
        .get(
            `${base}/api/admin/email/preview/html/reset-password?name=Test%20Test`,
        )
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(res => 'Test Test' in res.body);
});

test('should render text preview of template', () => {
    expect.assertions(0);
    const { request, base } = getSetup();
    return request
        .get(
            `${base}/api/admin/email/preview/text/reset-password?name=Test%20Test`,
        )
        .expect('Content-Type', /plain/)
        .expect(200)
        .expect(res => 'Test Test' in res.body);
});

test('Requesting a non-existing template should yield 404', () => {
    expect.assertions(0);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/email/preview/text/some-non-existing-template`)
        .expect(404);
});
