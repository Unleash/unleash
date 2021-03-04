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

function getSetup(databaseIsUp = true) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores(databaseIsUp);
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
        tagStore: stores.tagStore,
        request: supertest(app),
    };
}

test('should get empty getTags via admin', t => {
    t.plan(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/tags`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.tags.length === 0);
        });
});

test('should get all tags added', t => {
    t.plan(1);
    const { request, tagStore, base } = getSetup();
    tagStore.createTag({
        type: 'simple',
        value: 'TeamGreen',
    });

    return request
        .get(`${base}/api/admin/tags`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.tags.length === 1);
        });
});

test('should be able to get single tag by type and value', t => {
    t.plan(1);
    const { request, base, tagStore } = getSetup();
    tagStore.createTag({ value: 'TeamRed', type: 'simple' });
    return request
        .get(`${base}/api/admin/tags/simple/TeamRed`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.tag.value, 'TeamRed');
        });
});

test('trying to get non-existing tag by name and type should not be found', t => {
    const { request, base } = getSetup();
    return request.get(`${base}/api/admin/tags/simple/TeamRed`).expect(res => {
        t.is(res.status, 404);
    });
});
test('should be able to delete a tag', t => {
    t.plan(0);
    const { request, base, tagStore, perms } = getSetup();
    perms.withPermissions(UPDATE_FEATURE);
    tagStore.createTag({ type: 'simple', value: 'TeamRed' });
    return request
        .delete(`${base}/api/admin/tags/simple/TeamGreen`)
        .expect(200);
});

test('should get empty tags of type', t => {
    t.plan(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/tags/simple`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.tags.length, 0);
        });
});

test('should be able to filter by type', t => {
    const { request, base, tagStore } = getSetup();
    tagStore.createTag({ type: 'simple', value: 'TeamRed' });
    tagStore.createTag({ type: 'slack', value: 'TeamGreen' });
    return request
        .get(`${base}/api/admin/tags/simple`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            t.is(res.body.tags.length, 1);
            t.is(res.body.tags[0].value, 'TeamRed');
        });
});

test('Getting tags while database is down should be a 500', t => {
    t.plan(0);
    getLogger.setMuteError(true);
    const { request, base } = getSetup(false);
    return request.get(`${base}/api/admin/tags`).expect(500);
});
