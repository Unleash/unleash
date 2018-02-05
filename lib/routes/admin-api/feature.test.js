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

test('should be allowed to use new toggle name', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/features/validate`)
        .send({ name: 'new.name' })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should not be allowed to reuse active toggle name', t => {
    t.plan(1);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addFeature({
        name: 'ts',
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/validate`)
        .send({ name: 'ts' })
        .set('Content-Type', 'application/json')
        .expect(403)
        .expect(res => {
            t.true(res.body[0].msg === 'A toggle with that name already exist');
        });
});

test('should not be allowed to reuse archived toggle name', t => {
    t.plan(1);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addArchivedFeature({
        name: 'ts.archived',
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/validate`)
        .send({ name: 'ts.archived' })
        .set('Content-Type', 'application/json')
        .expect(403)
        .expect(res => {
            t.true(
                res.body[0].msg ===
                    'An archived toggle with that name already exist'
            );
        });
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

test('valid feature names should pass validation', t => {
    t.plan(0);
    const { request, base } = getSetup();

    const validNames = [
        'com.example',
        'com.exampleFeature',
        'com.example-company.feature',
        'com.example-company.exampleFeature',
        '123',
        'com.example-company.someFeature.123',
    ];

    return Promise.all(
        validNames.map(name =>
            request
                .post(`${base}/api/admin/features`)
                .send({
                    name,
                    enabled: false,
                    strategies: [{ name: 'default' }],
                })
                .set('Content-Type', 'application/json')
                .expect(201)
        )
    );
});

test('invalid feature names should not pass validation', t => {
    t.plan(0);
    const { request, base } = getSetup();

    const invalidNames = [
        'some example',
        'some$example',
        'me&me',
        '   ',
        'o2%ae',
    ];

    return Promise.all(
        invalidNames.map(name =>
            request
                .post(`${base}/api/admin/features`)
                .send({
                    name,
                    enabled: false,
                    strategies: [{ name: 'default' }],
                })
                .set('Content-Type', 'application/json')
                .expect(400)
        )
    );
});

test('should not allow variants with same name when creating feature flag', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/features`)
        .send({
            name: 'ts',
            strategies: [{ name: 'default' }],
            variants: [{ name: 'variant1' }, { name: 'variant1' }],
        })
        .set('Content-Type', 'application/json')
        .expect(403);
});

test('should not allow variants with same name when updating feature flag', t => {
    t.plan(0);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addFeature({
        name: 'ts',
        strategies: [{ name: 'default' }],
    });

    return request
        .put(`${base}/api/admin/features/ts`)
        .send({
            name: 'ts',
            strategies: [{ name: 'default' }],
            variants: [{ name: 'variant1' }, { name: 'variant1' }],
        })
        .set('Content-Type', 'application/json')
        .expect(403);
});
