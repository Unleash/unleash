'use strict';

const test = require('ava');
const store = require('./fixtures/store');
const supertest = require('supertest');
const getApp = require('../../../lib/app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

function getSetup () {
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

test('should add version numbers for /stategies', t => {
    const { request, base } = getSetup();

    return request
        .get(`${base}/api/strategies`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            t.true(res.body.version === 1);
        });
});

test('should require a name when creating a new stratey', t => {
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/strategies`)
        .send({})
        .expect(400)
        .expect((res) => {
            t.true(res.body.name === 'ValidationError');
        });
});

test('should require parameters array when creating a new stratey', t => {
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/strategies`)
        .send({ name: 'TestStrat' })
        .expect(400)
        .expect((res) => {
            t.true(res.body.name === 'ValidationError');
        });
});

test('should create a new stratey with empty parameters', () => {
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/strategies`)
        .send({ name: 'TestStrat', parameters: [] })
        .expect(201);
});

test('should not be possible to override name', () => {
    const { request, base, strategyStore } = getSetup();
    strategyStore.addStrategy({ name: 'Testing', parameters: [] });

    return request
        .post(`${base}/api/strategies`)
        .send({ name: 'Testing', parameters: [] })
        .expect(403);
});

test('should update strategy', () => {
    const name = 'AnotherStrat';
    const { request, base, strategyStore } = getSetup();
    strategyStore.addStrategy({ name, parameters: [] });

    return request
        .put(`${base}/api/strategies/${name}`)
        .send({ name, parameters: [], description: 'added' })
        .expect(200);
});

test('should not update uknown strategy', () => {
    const name = 'UnknownStrat';
    const { request, base } = getSetup();

    return request
        .put(`${base}/api/strategies/${name}`)
        .send({ name, parameters: [], description: 'added' })
        .expect(404);
});

test('should validate format when updating strategy', () => {
    const name = 'AnotherStrat';
    const { request, base, strategyStore } = getSetup();
    strategyStore.addStrategy({ name, parameters: [] });

    return request
        .put(`${base}/api/strategies/${name}`)
        .send({  })
        .expect(400);
});
