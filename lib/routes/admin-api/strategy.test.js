'use strict';

const test = require('ava');
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
        strategyStore: stores.strategyStore,
        request: supertest(app),
    };
}

test('add version numbers for /stategies', t => {
    t.plan(1);
    const { request, base } = getSetup();

    return request
        .get(`${base}/api/admin/strategies`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.version === 1);
        });
});

test('require a name when creating a new stratey', t => {
    t.plan(1);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/strategies`)
        .send({})
        .expect(400)
        .expect(res => {
            t.true(res.body.name === 'ValidationError');
        });
});

test('require parameters array when creating a new stratey', t => {
    t.plan(1);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/strategies`)
        .send({ name: 'TestStrat' })
        .expect(400)
        .expect(res => {
            t.true(res.body.name === 'ValidationError');
        });
});

test('create a new stratey with empty parameters', t => {
    t.plan(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/strategies`)
        .send({ name: 'TestStrat', parameters: [] })
        .expect(201);
});

test('not be possible to override name', t => {
    t.plan(0);
    const { request, base, strategyStore } = getSetup();
    strategyStore.addStrategy({ name: 'Testing', parameters: [] });

    return request
        .post(`${base}/api/admin/strategies`)
        .send({ name: 'Testing', parameters: [] })
        .expect(403);
});

test('update strategy', t => {
    t.plan(0);
    const name = 'AnotherStrat';
    const { request, base, strategyStore } = getSetup();
    strategyStore.addStrategy({ name, parameters: [] });

    return request
        .put(`${base}/api/admin/strategies/${name}`)
        .send({ name, parameters: [], description: 'added' })
        .expect(200);
});

test('not update uknown strategy', t => {
    t.plan(0);
    const name = 'UnknownStrat';
    const { request, base } = getSetup();

    return request
        .put(`${base}/api/admin/strategies/${name}`)
        .send({ name, parameters: [], description: 'added' })
        .expect(404);
});

test('validate format when updating strategy', t => {
    t.plan(0);
    const name = 'AnotherStrat';
    const { request, base, strategyStore } = getSetup();
    strategyStore.addStrategy({ name, parameters: [] });

    return request
        .put(`${base}/api/admin/strategies/${name}`)
        .send({})
        .expect(400);
});

test('editable=false will stop delete request', t => {
    t.plan(0);
    const name = 'default';
    const { request, base } = getSetup();

    return request.delete(`${base}/api/admin/strategies/${name}`).expect(500);
});

test('editable=false will stop edit request', t => {
    t.plan(0);
    const name = 'default';
    const { request, base } = getSetup();

    return request
        .put(`${base}/api/admin/strategies/${name}`)
        .send({ name, parameters: [] })
        .expect(500);
});

test('editable=true will allow delete request', t => {
    t.plan(0);
    const name = 'deleteStrat';
    const { request, base, strategyStore } = getSetup();
    strategyStore.addStrategy({ name, parameters: [] });

    return request
        .delete(`${base}/api/admin/strategies/${name}`)
        .send({})
        .expect(200);
});

test('editable=true will allow edit request', t => {
    t.plan(0);
    const name = 'editStrat';
    const { request, base, strategyStore } = getSetup();
    strategyStore.addStrategy({ name, parameters: [] });

    return request
        .put(`${base}/api/admin/strategies/${name}`)
        .send({ name, parameters: [] })
        .expect(200);
});
