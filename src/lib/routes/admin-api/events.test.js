'use strict';

import { createServices } from '../../services';
import { createTestConfig } from '../../../test/config/test-config';

const test = require('ava');

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');

const getApp = require('../../app');

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return { base, eventStore: stores.eventStore, request: supertest(app) };
}

test('should get empty events list via admin', t => {
    t.plan(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/events`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.events.length === 0);
        });
});
