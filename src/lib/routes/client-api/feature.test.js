'use strict';

const test = require('ava');
const supertest = require('supertest');
const { EventEmitter } = require('events');
const sinon = require('sinon');
const store = require('../../../test/fixtures/store');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');
const { createServices } = require('../../services');
const FeatureController = require('./feature');

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

test('if caching is enabled should memoize', t => {
    const getFeatures = sinon.fake.returns([]);

    const featureToggleService = {
        getFeatures,
    };
    const controller = new FeatureController(
        { featureToggleService },
        {
            getLogger,
            experimental: {
                clientFeatureMemoize: {
                    enabled: true,
                    maxAge: 10000,
                },
            },
        },
    );
    controller.getAll({ query: {} }, { json: () => {} });
    controller.getAll({ query: {} }, { json: () => {} });
    t.is(getFeatures.callCount, 1);
});

test('if caching is not enabled all calls goes to service', t => {
    const getFeatures = sinon.fake.returns([]);

    const featureToggleService = {
        getFeatures,
    };
    const controller = new FeatureController(
        { featureToggleService },
        {
            getLogger,
            experimental: {
                clientFeatureMemoize: {
                    enabled: false,
                    maxAge: 10000,
                },
            },
        },
    );
    controller.getAll({ query: {} }, { json: () => {} });
    controller.getAll({ query: {} }, { json: () => {} });
    t.is(getFeatures.callCount, 2);
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
            t.is(res.body.features.length, 2);
            t.is(res.body.features[1].name, 'b_test2');
        });
});

test('support filtering on project', t => {
    t.plan(2);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.createFeature({ name: 'a_test1', project: 'projecta' });
    featureToggleStore.createFeature({ name: 'b_test2', project: 'projectb' });
    return request
        .get(`${base}/api/client/features?project=projecta`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.features.length, 1);
            t.is(res.body.features[0].name, 'a_test1');
        });
});
