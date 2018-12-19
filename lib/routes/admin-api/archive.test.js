'use strict';

const test = require('ava');
const store = require('./../../../test/fixtures/store');
const permissions = require('../../../test/fixtures/permissions');
const supertest = require('supertest');
const getApp = require('../../app');
const { UPDATE_FEATURE } = require('../../permissions');

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
        archiveStore: stores.featureToggleStore,
        eventStore: stores.eventStore,
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
    const { request, base, archiveStore, perms } = getSetup();
    perms.withPerms(UPDATE_FEATURE);
    archiveStore.addArchivedFeature({
        name,
        strategies: [{ name: 'default' }],
    });

    return request.post(`${base}/api/admin/archive/revive/${name}`).expect(200);
});

test('should create event when reviving toggle', async t => {
    t.plan(4);
    const name = 'name1';
    const { request, base, archiveStore, eventStore, perms } = getSetup();
    perms.withPerms(UPDATE_FEATURE);
    archiveStore.addArchivedFeature({
        name,
        strategies: [{ name: 'default' }],
    });

    await request.post(`${base}/api/admin/archive/revive/${name}`);

    const events = await eventStore.getEvents();
    t.is(events.length, 1);
    t.is(events[0].type, 'feature-revived');
    t.is(events[0].data.name, name);
    t.is(events[0].createdBy, 'unknown');
});

test('should require toggle name when reviving', t => {
    t.plan(0);
    const { request, base } = getSetup();
    return request.post(`${base}/api/admin/archive/revive/`).expect(404);
});
