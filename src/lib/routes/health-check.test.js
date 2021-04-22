'use strict';;
import { createServices } from '../services';
import { createTestConfig } from '../../test/config/test-config';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../test/fixtures/store');
const getLogger = require('../../test/fixtures/no-logger');
const getApp = require('../app');

const eventBus = new EventEmitter();

function getSetup() {
    const stores = store.createStores();
    const { db } = stores;
    const config = createTestConfig();
    const app = getApp(
        config,
        stores,
        createServices(stores, config),
        eventBus,
    );

    return {
        db,
        request: supertest(app),
    };
}

afterEach(() => {
    getLogger.setMuteError(false);
});

test('should give 500 when db is failing', () => {
    getLogger.setMuteError(true);
    expect.assertions(2);
    const { request, db } = getSetup();
    db.raw = () => Promise.reject(new Error('db error'));
    return request
        .get('/health')
        .expect(500)
        .expect(res => {
            expect(res.status === 500).toBe(true);
            expect(res.body.health === 'BAD').toBe(true);
        });
});

test('should give 200 when db is not failing', () => {
    expect.assertions(0);
    const { request, db } = getSetup();
    db.raw = () => Promise.resolve();
    return request.get('/health').expect(200);
});

test('should give health=GOOD when db is not failing', () => {
    expect.assertions(2);
    const { request, db } = getSetup();
    db.raw = () => Promise.resolve();
    return request
        .get('/health')
        .expect(200)
        .expect(res => {
            expect(res.status === 200).toBe(true);
            expect(res.body.health === 'GOOD').toBe(true);
        });
});
