'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');
const { createServices } = require('../../services');
const FeatureController = require('./feature');
const { createTestConfig } = require('../../../test/config/test-config');

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
    });
    const app = getApp(
        config,
        stores,
        createServices(stores, config),
        eventBus,
    );

    return {
        base,
        featureToggleStore: stores.featureToggleStore,
        request: supertest(app),
    };
}

test('should get empty getFeatures via client', () => {
    expect.assertions(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/client/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length === 0).toBe(true);
        });
});

test('if caching is enabled should memoize', () => {
    const getFeatures = jest.fn().mockReturnValue([]);

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
    expect(getFeatures).toHaveBeenCalledTimes(1);
});

test('if caching is not enabled all calls goes to service', () => {
    const getFeatures = jest.fn().mockReturnValue([]);

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
    expect(getFeatures).toHaveBeenCalledTimes(2);
});

test('fetch single feature', () => {
    expect.assertions(1);
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
            expect(res.body.name === 'test_').toBe(true);
        });
});

test('support name prefix', () => {
    expect.assertions(2);
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
            expect(res.body.features.length).toBe(2);
            expect(res.body.features[1].name).toBe('b_test2');
        });
});

test('support filtering on project', () => {
    expect.assertions(2);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.createFeature({ name: 'a_test1', project: 'projecta' });
    featureToggleStore.createFeature({ name: 'b_test2', project: 'projectb' });
    return request
        .get(`${base}/api/client/features?project=projecta`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length).toBe(1);
            expect(res.body.features[0].name).toBe('a_test1');
        });
});
