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

test('should accept empty client metrics', t => {
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

test('should accept client metrics with yes/no', t => {
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
                toggles: {
                    toggleA: {
                        yes: 200,
                        no: 0,
                    },
                },
            },
        })
        .expect(202);
});

test('should not accept client metrics without yes/no', t => {
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
                toggles: {
                    toggleA: {
                        blue: 200,
                        green: 0,
                    },
                },
            },
        })
        .expect(400);
});
