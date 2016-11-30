'use strict';

const test = require('ava');
const store = require('./fixtures/store');
const supertest = require('supertest');
const logger = require('../../../lib/logger');
const getApp = require('../../../lib/app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

test.beforeEach(() =>  {
    logger.setLevel('FATAL');
});

test('should use enable prometheus', t => {
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
        .expect(200)
});
