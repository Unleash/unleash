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
        archiveStore: stores.featureToggleStore,
        request: supertest(app),
    };
}

test('should get empty getFeatures via admin', t => {
    t.plan(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/archive/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 0);
        });
});

test('should get archived toggles via admin', t => {
    t.plan(1);
    const { request, base, archiveStore } = getSetup();
    archiveStore.addArchivedFeature({
        name: 'test1',
        strategies: [{ name: 'default' }],
    });
    archiveStore.addArchivedFeature({
        name: 'test2',
        strategies: [{ name: 'default' }],
    });
    return request
        .get(`${base}/api/admin/archive/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 2);
        });
});

test('should revive toggle', t => {
    t.plan(0);
    const name = 'name1';
    const { request, base, archiveStore } = getSetup();
    archiveStore.addArchivedFeature({
        name,
        strategies: [{ name: 'default' }],
    });

    return request.post(`${base}/api/admin/archive/revive/${name}`).expect(200);
});
