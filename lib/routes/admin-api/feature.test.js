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
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: base,
        stores,
        eventBus,
    });

    return {
        base,
        featureToggleStore: stores.featureToggleStore,
        request: supertest(app),
    };
}

test('should get empty getFeatures via admin', t => {
    t.plan(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 0);
        });
});

test('should get one getFeature', t => {
    t.plan(1);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addFeature({
        name: 'test_',
        strategies: [{ name: 'default_' }],
    });

    return request
        .get(`${base}/api/admin/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 1);
        });
});

test('should add version numbers for /features', t => {
    t.plan(1);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addFeature({
        name: 'test2',
        strategies: [{ name: 'default' }],
    });

    return request
        .get(`${base}/api/admin/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.version === 1);
        });
});

test('should require at least one strategy when creating a feature toggle', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/features`)
        .send({ name: 'sample.missing.strategy' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should require at least one strategy when updating a feature toggle', t => {
    t.plan(0);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addFeature({
        name: 'ts',
        strategies: [{ name: 'default' }],
    });

    return request
        .put(`${base}/api/admin/features/ts`)
        .send({ name: 'ts' })
        .set('Content-Type', 'application/json')
        .expect(400);
});
