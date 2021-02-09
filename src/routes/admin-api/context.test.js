'use strict';

const test = require('ava');
const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../test/fixtures/store');
const getLogger = require('../../test/fixtures/no-logger');
const getApp = require('../../app');

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: base,
        stores,
        eventBus,
        extendedPermissions: false,
        customContextFields: [{ name: 'tenantId' }],
        getLogger,
    });

    return {
        base,
        request: supertest(app),
    };
}

test('should get all context definitions', t => {
    t.plan(2);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/context`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.length === 3);
            const envField = res.body.find(c => c.name === 'environment');
            t.true(envField.name === 'environment');
        });
});

test('should get context definition', t => {
    t.plan(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/context/userId`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.name, 'userId');
        });
});

test('should be allowed to use new context field name', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/context/validate`)
        .send({ name: 'new.name' })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('should not be allowed reuse context field name', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/context/validate`)
        .send({ name: 'environment' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('should create a context field', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/context`)
        .send({ name: 'fancy', description: 'Bla bla' })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should create a context field with legal values', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/context`)
        .send({
            name: 'page',
            description: 'Bla bla',
            legalValues: ['blue', 'red'],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should require name when creating a context field', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/context`)
        .send({ description: 'Bla bla' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should not create a context field with existing name', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/context`)
        .send({ name: 'userId', description: 'Bla bla' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('should not create a context field with duplicate legal values', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/context`)
        .send({
            name: 'page',
            description: 'Bla bla',
            legalValues: ['blue', 'blue'],
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should update a context field with new legal values', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .put(`${base}/api/admin/context/environment`)
        .send({
            name: 'environment',
            description: 'Used target application envrionments',
            legalValues: ['local', 'stage', 'production'],
        })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('should not delete a unknown context field', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .delete(`${base}/api/admin/context/unknown`)
        .set('Content-Type', 'application/json')
        .expect(404);
});

test('should delete a context field', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .delete(`${base}/api/admin/context/appName`)
        .set('Content-Type', 'application/json')
        .expect(200);
});
