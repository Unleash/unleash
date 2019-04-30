'use strict';

const test = require('ava');
const store = require('./../../../test/fixtures/store');
const getLogger = require('../../../test/fixtures/no-logger');
const supertest = require('supertest');
const getApp = require('../../app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

const uiConfig = {
    headerBackground: 'red',
    slogan: 'hello',
};

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: base,
        stores,
        eventBus,
        extendedPermissions: false,
        ui: uiConfig,
        getLogger,
    });

    return {
        base,
        request: supertest(app),
    };
}

test('should get ui config', t => {
    t.plan(2);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/ui-config`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.slogan === 'hello');
            t.true(res.body.headerBackground === 'red');
        });
});
