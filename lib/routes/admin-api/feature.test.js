'use strict';

const test = require('ava');
const store = require('./../../../test/fixtures/store');
const permissions = require('../../../test/fixtures/permissions');
const supertest = require('supertest');
const getApp = require('../../app');
const { UPDATE_FEATURE, CREATE_FEATURE } = require('../../permissions');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const perms = permissions();
    const app = getApp({
        baseUriPath: base,
        stores,
        eventBus,
        extendedPermissions: true,
        preRouterHook: perms.hook,
    });

    return {
        base,
        perms,
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
    const { request, base, perms } = getSetup();
    perms.withPermissions(CREATE_FEATURE);

    return request
        .post(`${base}/api/admin/features`)
        .send({ name: 'sample.missing.strategy' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should be allowed to use new toggle name', t => {
    t.plan(0);
    const { request, base, perms } = getSetup();
    perms.withPermissions(CREATE_FEATURE);

    return request
        .post(`${base}/api/admin/features/validate`)
        .send({ name: 'new.name' })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should be allowed to have variants="null"', t => {
    t.plan(0);
    const { request, base, perms } = getSetup();
    perms.withPermissions(CREATE_FEATURE);

    return request
        .post(`${base}/api/admin/features`)
        .send({
            name: 'new.name.null',
            enabled: false,
            strategies: [{ name: 'default' }],
            variants: null,
        })
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
        .expect(400)
        .expect(res => {
            t.true(
                res.body.details[0].message ===
                    'A toggle with that name already exist'
            );
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
        .expect(400)
        .expect(res => {
            t.true(
                res.body.details[0].message ===
                    'An archived toggle with that name already exist'
            );
        });
});

test('should require at least one strategy when updating a feature toggle', t => {
    t.plan(0);
    const { request, featureToggleStore, base, perms } = getSetup();
    perms.withPermissions(UPDATE_FEATURE);
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
    const { request, base, perms } = getSetup();
    perms.withPermissions(CREATE_FEATURE);

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
    const { request, base, perms } = getSetup();
    perms.withPermissions(CREATE_FEATURE);

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

// Make sure current UI works. Should align on joi errors in future.
test('invalid feature names should have error msg', t => {
    t.plan(1);
    const { request, base, perms } = getSetup();
    perms.withPermissions(CREATE_FEATURE);

    const name = 'ØÆ`';

    return request
        .post(`${base}/api/admin/features`)
        .send({
            name,
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect(res => {
            t.true(
                res.body.details[0].message === '"name" must be URL friendly'
            );
        });
});

test('should not allow variants with same name when creating feature flag', t => {
    t.plan(0);
    const { request, base, perms } = getSetup();
    perms.withPermissions(CREATE_FEATURE);

    return request
        .post(`${base}/api/admin/features`)
        .send({
            name: 't.variant',
            enabled: true,
            strategies: [{ name: 'default' }],
            variants: [
                { name: 'variant1', weight: 50 },
                { name: 'variant1', weight: 50 },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should not allow variants with same name when updating feature flag', t => {
    t.plan(0);
    const { request, featureToggleStore, base, perms } = getSetup();
    perms.withPermissions(UPDATE_FEATURE);

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
        .expect(400);
});

test('should toggle on', t => {
    t.plan(1);
    const { request, featureToggleStore, base, perms } = getSetup();
    perms.withPermissions(UPDATE_FEATURE);

    featureToggleStore.addFeature({
        name: 'toggle.disabled',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/toggle.disabled/toggle/on`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.enabled === true);
        });
});

test('should toggle off', t => {
    t.plan(1);
    const { request, featureToggleStore, base, perms } = getSetup();
    perms.withPermissions(UPDATE_FEATURE);

    featureToggleStore.addFeature({
        name: 'toggle.enabled',
        enabled: true,
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/toggle.enabled/toggle/off`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.enabled === false);
        });
});

test('should toggle', t => {
    t.plan(1);
    const { request, featureToggleStore, base, perms } = getSetup();
    perms.withPermissions(UPDATE_FEATURE);

    featureToggleStore.addFeature({
        name: 'toggle.disabled',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/toggle.disabled/toggle`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.enabled === true);
        });
});
