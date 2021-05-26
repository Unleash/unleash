'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const permissions = require('../../../test/fixtures/permissions');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');
const { createTestConfig } = require('../../../test/config/test-config');
const { createServices } = require('../../services');

const eventBus = new EventEmitter();

function getSetup(databaseIsUp = true) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores(databaseIsUp);
    const perms = permissions();
    const config = createTestConfig({
        server: { baseUriPath: base },
        preRouterHook: perms.hook,
    });
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        base,
        perms,
        tagStore: stores.tagStore,
        request: supertest(app),
    };
}

test('should get empty getTags via admin', () => {
    expect.assertions(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/tags`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tags.length === 0).toBe(true);
        });
});

test('should get all tags added', () => {
    expect.assertions(1);
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
            expect(res.body.tags.length === 1).toBe(true);
        });
});

test('should be able to get single tag by type and value', () => {
    expect.assertions(1);
    const { request, base, tagStore } = getSetup();
    tagStore.createTag({ value: 'TeamRed', type: 'simple' });
    return request
        .get(`${base}/api/admin/tags/simple/TeamRed`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tag.value).toBe('TeamRed');
        });
});

test('trying to get non-existing tag by name and type should not be found', () => {
    const { request, base } = getSetup();
    return request.get(`${base}/api/admin/tags/simple/TeamRed`).expect(res => {
        expect(res.status).toBe(404);
    });
});
test('should be able to delete a tag', () => {
    expect.assertions(0);
    const { request, base, tagStore } = getSetup();
    tagStore.createTag({ type: 'simple', value: 'TeamRed' });
    return request
        .delete(`${base}/api/admin/tags/simple/TeamGreen`)
        .expect(200);
});

test('should get empty tags of type', () => {
    expect.assertions(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/tags/simple`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tags.length).toBe(0);
        });
});

test('should be able to filter by type', () => {
    const { request, base, tagStore } = getSetup();
    tagStore.createTag({ type: 'simple', value: 'TeamRed' });
    tagStore.createTag({ type: 'slack', value: 'TeamGreen' });
    return request
        .get(`${base}/api/admin/tags/simple`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            expect(res.body.tags.length).toBe(1);
            expect(res.body.tags[0].value).toBe('TeamRed');
        });
});

test('Getting tags while database is down should be a 500', () => {
    expect.assertions(0);
    getLogger.setMuteError(true);
    const { request, base } = getSetup(false);
    return request.get(`${base}/api/admin/tags`).expect(500);
});
