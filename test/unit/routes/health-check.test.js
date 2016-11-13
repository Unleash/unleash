'use strict';

const test = require('ava');
const store = require('./fixtures/store');
const supertest = require('supertest');
const logger = require('../../../lib/logger');

test.beforeEach(() =>  {
    logger.setLevel('FATAL');
});


function getSetup () {
    const stores = store.createStores();
    const db = stores.db;
    const app = require('../../../app')({
        baseUriPath: '',
        stores,
    });

    return {
        db,
        request: supertest(app),
    };
}

test('should give 500 when db is failing', t => {
    const { request, db } = getSetup();
    db.select = () => ({
        from: () => Promise.reject(new Error('db error')),
    });
    return request
        .get('/health')
        .expect(500)
        .expect((res) => {
            t.true(res.status === 500);
            t.true(res.body.health === 'BAD');
        });
});

test('should give 200 when db is not failing', () => {
    const { request } = getSetup();
    return request
        .get('/health')
        .expect(200);
});

test('should give health=GOOD when db is not failing', t => {
    const { request } = getSetup();
    return request
        .get('/health')
        .expect(200)
        .expect((res) => {
            t.true(res.status === 200);
            t.true(res.body.health === 'GOOD');
        });
});

