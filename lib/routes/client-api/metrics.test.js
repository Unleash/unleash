'use strict';

const test = require('ava');
const supertest = require('supertest');
const joi = require('joi');
const store = require('./../../../test/fixtures/store');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');
const { clientMetricsSchema } = require('./metrics-schema');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

function getSetup() {
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: '',
        stores,
        eventBus,
        getLogger,
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

test('should accept client metrics with variants', t => {
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
                        variants: {
                            variant1: 1,
                            variant2: 2,
                        },
                    },
                },
            },
        })
        .expect(202);
});

test('should accept client metrics without yes/no', t => {
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
        .expect(202);
});

test('shema allow empty strings', t => {
    const data = {
        appName: 'java-test',
        instanceId: 'instance y',
        bucket: {
            toggles: { Demo2: { yes: '', no: '', variants: {} } },
            start: '2019-05-06T08:30:40.514Z',
            stop: '2019-05-06T09:30:50.515Z',
        },
    };
    const { error, value } = joi.validate(data, clientMetricsSchema);
    t.falsy(error);
    t.is(value.bucket.toggles.Demo2.yes, 0);
    t.is(value.bucket.toggles.Demo2.no, 0);
});

test('shema allow yes=<string nbr>', t => {
    const data = {
        appName: 'java-test',
        instanceId: 'instance y',
        bucket: {
            toggles: { Demo2: { yes: '12', no: 256, variants: {} } },
            start: '2019-05-06T08:30:40.514Z',
            stop: '2019-05-06T09:30:50.515Z',
        },
    };
    const { error, value } = joi.validate(data, clientMetricsSchema);
    t.falsy(error);
    t.is(value.bucket.toggles.Demo2.yes, 12);
    t.is(value.bucket.toggles.Demo2.no, 256);
});
