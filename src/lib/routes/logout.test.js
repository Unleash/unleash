'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const { createServices } = require('../services');
const { createTestConfig } = require('../../test/config/test-config');

const store = require('../../test/fixtures/store');
const getApp = require('../app');
const User = require('../types/user');

const eventBus = new EventEmitter();

const currentUser = new User({ id: 1337, email: 'test@mail.com' });

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
    const services = createServices(stores, config);

    const app = getApp(config, stores, services, eventBus);

    return {
        base,
        strategyStore: stores.strategyStore,
        request: supertest(app),
        destroy: () => {
            services.versionService.destroy();
            services.clientMetricsService.destroy();
            services.apiTokenService.destroy();
        },
    };
}

test('should logout and redirect', async () => {
    expect.assertions(0);
    const { base, request, destroy } = getSetup();
    await request
        .get(`${base}/logout`)
        .expect(302)
        .expect('Location', `${base}/`);
    destroy();
});
