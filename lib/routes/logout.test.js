'use strict';

const test = require('ava');
const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../test/fixtures/store');
const getLogger = require('../../test/fixtures/no-logger');
const getApp = require('../app');
const User = require('../user');

const eventBus = new EventEmitter();

const currentUser = new User({ email: 'test@mail.com' });

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: base,
        stores,
        eventBus,
        getLogger,
        preHook: a => {
            a.use((req, res, next) => {
                req.user = currentUser;
                next();
            });
        },
    });

    return {
        base,
        strategyStore: stores.strategyStore,
        request: supertest(app),
    };
}

test('should logout and redirect', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .get(`${base}/logout`)
        .expect(302)
        .expect('Location', `${base}/`);
});
