'use strict';

const test = require('ava');
const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const permissions = require('../../../test/fixtures/permissions');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');

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
        getLogger,
    });

    return {
        base,
        perms,
        featureTagStore: stores.featureTagStore,
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
    const { request, featureTagStore, base } = getSetup();
    featureTagStore.addTag({
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
    const { request, featureTagStore, base } = getSetup();
    featureTagStore.addTag({
        id: 1,
        type: 'simple',
        value: 'TeamRed',
    });
    return request
        .get(`${base}/api/admin/tags/simple/TeamRed`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.tag.value, 'TeamRed');
        });
});

test('trying to get non-existing tag should not be found', t => {
    const { request, featureTagStore, base } = getSetup();
    featureTagStore.addTag({
        id: 1,
        type: 'simple',
        value: 'TeamRed',
    });
    return request.get(`${base}/api/admin/tags/id/1125`).expect(res => {
        t.is(res.status, 404);
    });
});
test('trying to get non-existing tag by name and type should not be found', t => {
    const { request, base } = getSetup();
    return request.get(`${base}/api/admin/tags/simple/TeamRed`).expect(res => {
        t.is(res.status, 404);
    });
});
test('should be able to delete a tag', t => {
    t.plan(1);
    const { request, featureTagStore, base } = getSetup();
    featureTagStore.addTag({
        type: 'simple',
        value: 'TeamGreen',
    });

    featureTagStore.removeTag({ type: 'simple', value: 'TeamGreen' });
    return request
        .get(`${base}/api/admin/tags`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.tags.length === 0);
        });
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
    const { request, base, featureTagStore } = getSetup();
    featureTagStore.addTag({
        id: 1,
        value: 'TeamRed',
        type: 'simple',
    });
    featureTagStore.addTag({
        id: 2,
        value: 'TeamGreen',
        type: 'slack',
    });
    return request
        .get(`${base}/api/admin/tags/simple`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            t.is(res.body.tags.length, 1);
            t.is(res.body.tags[0].value, 'TeamRed');
        });
});
