'use strict';

const test = require('ava');
const store = require('./../../../test/fixtures/store');
const supertest = require('supertest');
const getApp = require('../../app');
const User = require('../../user');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

const currentUser = new User({ email: 'test@mail.com' });

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: base,
        stores,
        eventBus,
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

test('should return current user', t => {
    t.plan(1);
    const { request, base } = getSetup();

    return request
        .get(`${base}/api/admin/user`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            t.true(res.body.email === currentUser.email);
        });
});

test('should logout and redirect', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .get(`${base}/api/admin/user/logout`)
        .expect(302)
        .expect('Location', '/');
});
