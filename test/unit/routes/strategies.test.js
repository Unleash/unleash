'use strict';

const test = require('ava');
const store = require('./fixtures/store');
const supertest = require('supertest');
const logger = require('../../../lib/logger');
const getApp = require('../../../lib/app');

test.beforeEach(() =>  {
    logger.setLevel('FATAL');
});

test('should add version numbers for /stategies', t => {
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: '',
        stores,
    });

    const request = supertest(app);

    return request
        .get('/api/strategies')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            t.true(res.body.version === 1);
        });
});
