'use strict';

const test = require('ava');
const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const permissions = require('../../../test/fixtures/permissions');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');
const { createServices } = require('../../services');
const { UPDATE_FEATURE } = require('../../permissions');

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const perms = permissions();
    const config = {
        baseUriPath: base,
        stores,
        eventBus,
        extendedPermissions: true,
        preRouterHook: perms.hook,
        getLogger,
    };
    const services = createServices(stores, config);
    const app = getApp(config, services);

    return {
        base,
        perms,
        archiveStore: stores.featureToggleStore,
        eventStore: stores.eventStore,
        featureToggleService: services.featureToggleService,
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
    perms.withPermissions(UPDATE_FEATURE);
    archiveStore.addArchivedFeature({
        name,
        strategies: [{ name: 'default' }],
    });

    return request.post(`${base}/api/admin/archive/revive/${name}`).expect(200);
});

test('should create event when reviving toggle', async t => {
    t.plan(6);
    const name = 'name1';
    const {
        request,
        base,
        featureToggleService,
        eventStore,
        perms,
    } = getSetup();
    perms.withPermissions(UPDATE_FEATURE);

    await featureToggleService.addArchivedFeature({
        name,
        strategies: [{ name: 'default' }],
    });

    await featureToggleService.addTag(
        name,
        {
            type: 'simple',
            value: 'tag',
        },
        'test@test.com',
    );

    await request.post(`${base}/api/admin/archive/revive/${name}`);

    const events = await eventStore.getEvents();
    t.is(events.length, 3);
    t.is(events[2].type, 'feature-revived');
    t.is(events[2].data.name, name);
    t.is(events[2].createdBy, 'unknown');
    t.is(events[2].tags[0].type, 'simple');
    t.is(events[2].tags[0].value, 'tag');
});

test('should require toggle name when reviving', t => {
    t.plan(0);
    const { request, base } = getSetup();
    return request.post(`${base}/api/admin/archive/revive/`).expect(404);
});
