'use strict';

const test = require('ava');
const store = require('./../../../test/fixtures/store');
const getLogger = require('../../../test/fixtures/no-logger');
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
        extendedPermissions: false,
        customContextFields: [{ name: 'tenantId' }],
        getLogger,
    });

    return {
        base,
        request: supertest(app),
    };
}

test('should get context definition', t => {
    t.plan(2);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/context`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.length === 4);
            const envField = res.body.find(c => c.name === 'environment');
            t.true(envField.name === 'environment');
        });
});
