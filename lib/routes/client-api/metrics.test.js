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

test('should validate client metrics', t => {
    t.plan(0);
    const { request } = getSetup();
    return request
        .post('/api/client/metrics')
        .send({ random: 'blush' })
        .expect(400);
});

test('should accept client metrics', t => {
    t.plan(0);
    const { request } = getSetup();
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {},
            },
        })
        .expect(202);
});
