'use strict';

const test = require('ava');
const store = require('./fixtures/store');
const supertest = require('supertest');
const logger = require('../../../lib/logger');
const getApp = require('../../../lib/app');

const { EventEmitter } = require('events');
const eventBus = new EventEmitter();

test.beforeEach(() =>  {
    logger.setLevel('FATAL');
});

function getSetup () {
    const stores = store.createStores();
    const app = getApp({
        baseUriPath: '',
        stores,
        eventBus,
    });

    return {
        request: supertest(app),
        stores
    };
}

test('should register client', () => {
    const { request } = getSetup();
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(202);
});

test('should require appName field', () => {
    const { request } = getSetup();
    return request
        .post('/api/client/register')
        .expect(400);
});

test('should require strategies field', () => {
    const { request } = getSetup();
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            // strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(400);
});

test('should validate client metrics', () => {
    const { request } = getSetup();
    return request
        .post('/api/client/metrics')
        .send({random: 'blush'})
        .expect(400);
});


test('should accept client metrics', () => {
    const { request } = getSetup();
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {},
            },
        })
        .expect(202);
});

test('should return seen toggles even when there is nothing', t => {
    const { request } = getSetup();
    return request
        .get('/api/client/seen-toggles')
        .expect(200)
        .expect((res) => {
            t.true(res.body.length === 0);
        });
});

test('should return list of seen-toggles per app', t => {
    const { request, stores } = getSetup();
    const appName = 'asd!23'
    stores.clientMetricsStore.emit('metrics', {
        appName,
        instanceId: 'instanceId',
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: {
                toggleX: {yes: 123,no: 0},
                toggleY: {yes: 123,no: 0}
            },
        },
    });

    return request
        .get('/api/client/seen-toggles')
        .expect(200)
        .expect((res) => {
            const seenAppsWithToggles = res.body; 
            t.true(seenAppsWithToggles.length === 1);
            t.true(seenAppsWithToggles[0].appName === appName);
            t.true(seenAppsWithToggles[0].seenToggles.length === 2);
        });
});

test('should return feature-toggles metrics even when there is nothing', t => {
    const { request } = getSetup();
    return request
        .get('/api/client/metrics/feature-toggles')
        .expect(200)
});

test('should return metrics for all toggles', t => {
    const { request, stores } = getSetup();
    const appName = 'asd!23'
    stores.clientMetricsStore.emit('metrics', {
        appName,
        instanceId: 'instanceId',
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: {
                toggleX: {yes: 123,no: 0},
                toggleY: {yes: 123,no: 0}
            },
        },
    });

    return request
        .get('/api/client/metrics/feature-toggles')
        .expect(200)
        .expect((res) => {
            
            const metrics = res.body; 
            t.true(metrics.lastHour !== undefined);
            t.true(metrics.lastMinute !== undefined);
        });
});


test('should return list of client strategies', t => {
    const { request, stores } = getSetup();
    return request
        .get('/api/client/strategies')
        .expect(200)
        .expect((res) => {
            t.true(res.body.length === 0);
        });
});

test('should return list of client applications', t => {
    const { request, stores } = getSetup();
    return request
        .get('/api/client/applications')
        .expect(200)
        .expect((res) => {
            t.true(res.body.applications.length === 0);
        });
});
