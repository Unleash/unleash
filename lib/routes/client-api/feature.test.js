'use strict';

const test = require('ava');
const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');
const { createServices } = require('../../services');

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const config = {
        baseUriPath: base,
        stores,
        eventBus,
        getLogger,
    };
    const app = getApp(config, createServices(stores, config));

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
    featureToggleStore.createFeature({
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
    featureToggleStore.createFeature({ name: 'a_test1' });
    featureToggleStore.createFeature({ name: 'a_test2' });
    featureToggleStore.createFeature({ name: 'b_test1' });
    featureToggleStore.createFeature({ name: 'b_test2' });

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
