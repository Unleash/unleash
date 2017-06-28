'use strict';

const { test } = require('ava');
const store = require('./../../../test/fixtures/store');
const supertest = require('supertest');
const logger = require('../../logger');
const getApp = require('../../app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

test.beforeEach(() => {
    logger.setLevel('FATAL');
});

function getSetup() {
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: '',
        stores,
        eventBus,
    });

    return {
        request: supertest(app),
        stores,
    };
}

test('should return list of client applications', t => {
    t.plan(1);
    const { request } = getSetup();
    return request
        .get('/api/admin/metrics/applications')
        .expect(200)
        .expect(res => {
            t.true(res.body.applications.length === 0);
        });
});
