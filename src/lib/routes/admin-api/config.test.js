'use strict';

import { createServices } from '../../services';
import { createTestConfig } from '../../../test/config/test-config';

const test = require('ava');
const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const getApp = require('../../app');

const eventBus = new EventEmitter();

const uiConfig = {
    headerBackground: 'red',
    slogan: 'hello',
};

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const config = createTestConfig({
        server: { baseUriPath: base },
        ui: uiConfig,
    });
    const stores = store.createStores();
    const app = getApp(
        config,
        stores,
        createServices(stores, config),
        eventBus,
    );

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
