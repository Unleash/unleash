'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../test/fixtures/store');
const getApp = require('../app');
const User = require('../user');
const { createServices } = require('../services');
const { createTestConfig } = require('../../test/config/test-config');

const eventBus = new EventEmitter();

const currentUser = new User({ email: 'test@mail.com' });

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
        preHook: a => {
            a.use((req, res, next) => {
                req.user = currentUser;
                next();
            });
        },
    });
    const app = getApp(
        config,
        stores,
        createServices(stores, config),
        eventBus,
    );

    return {
        base,
        strategyStore: stores.strategyStore,
        request: supertest(app),
    };
}

test('should logout and redirect', () => {
    expect.assertions(0);
    const { request, base } = getSetup();

    return request
        .get(`${base}/logout`)
        .expect(302)
        .expect('Location', `${base}/`);
});
