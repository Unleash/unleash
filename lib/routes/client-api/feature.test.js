'use strict';

const { test } = require('ava');
const store = require('./../../../test/fixtures/store');
const supertest = require('supertest');
const getApp = require('../../app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

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

test('should get empty getFeatures via client', t => {
    t.plan(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/client/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 0);
        });
});

test('fetch single feature', t => {
    t.plan(1);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addFeature({
        name: 'test_',
        strategies: [{ name: 'default' }],
    });

    return request
        .get(`${base}/api/client/features/test_`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.name === 'test_');
        });
});

test('fetch enabled features', t => {
    t.plan(2);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addFeature({
        name: 'test_enabled',
        enabled: true,
        strategies: [{ name: 'default' }],
    });

    featureToggleStore.addFeature({
        name: 'test_disabled',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    return request
        .get(`${base}/api/client/features?enabled=true`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 1);
            t.is(res.body.features[0].name, 'test_enabled');
        });
});

test('fetch features with specific name', t => {
    t.plan(2);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addFeature({
        name: 'test-one',
        enabled: true,
        strategies: [{ name: 'default' }],
    });

    featureToggleStore.addFeature({
        name: 'test-two',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    return request
        .get(`${base}/api/client/features?name=test-two`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 1);
            t.is(res.body.features[0].name, 'test-two');
        });
});
