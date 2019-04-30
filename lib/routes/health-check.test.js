'use strict';

const test = require('ava');
const store = require('./../../test/fixtures/store');
const getLogger = require('../../test/fixtures/no-logger');
const supertest = require('supertest');
const getApp = require('../app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

function getSetup() {
    const stores = store.createStores();
    const db = stores.db;
    const app = getApp({
        baseUriPath: '',
        stores,
        eventBus,
        getLogger,
    });

    return {
        db,
        request: supertest(app),
    };
}

test('should give 500 when db is failing', t => {
    t.plan(2);
    const { request, db } = getSetup();
    db.select = () => ({
        from: () => Promise.reject(new Error('db error')),
    });
    return request
        .get('/health')
        .expect(500)
        .expect(res => {
            t.true(res.status === 500);
            t.true(res.body.health === 'BAD');
        });
});

test('should give 200 when db is not failing', t => {
    t.plan(0);
    const { request } = getSetup();
    return request.get('/health').expect(200);
});

test('should give health=GOOD when db is not failing', t => {
    t.plan(2);
    const { request } = getSetup();
    return request
        .get('/health')
        .expect(200)
        .expect(res => {
            t.true(res.status === 200);
            t.true(res.body.health === 'GOOD');
        });
});
