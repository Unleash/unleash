'use strict';

const test = require('ava');
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

test('support name prefix', t => {
    t.plan(2);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addFeature({ name: 'a_test1' });
    featureToggleStore.addFeature({ name: 'a_test2' });
    featureToggleStore.addFeature({ name: 'b_test1' });
    featureToggleStore.addFeature({ name: 'b_test2' });

    const namePrefix = 'b_';

    return request
        .get(`${base}/api/client/features?namePrefix=${namePrefix}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 2);
            t.true(res.body.features[1].name === 'b_test2');
        });
});
