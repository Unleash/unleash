'use strict';

const { test } = require('ava');
const store = require('./../../test/fixtures/store');
const supertest = require('supertest');
const logger = require('../logger');
const getApp = require('../app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

test.beforeEach(() => {
    logger.setLevel('FATAL');
});

test('should use enable prometheus', t => {
    t.plan(0);
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: '',
        serverMetrics: true,
        stores,
        eventBus,
    });

    const request = supertest(app);

    return request
        .get('/internal-backstage/prometheus')
        .expect('Content-Type', /text/)
        .expect(200);
});
