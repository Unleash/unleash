'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const permissions = require('../../../test/fixtures/permissions');
const getApp = require('../../app');
const { createTestConfig } = require('../../../test/config/test-config');
const { createServices } = require('../../services');

const eventBus = new EventEmitter();

function getSetup() {
    const stores = store.createStores();
    const perms = permissions();
    const config = createTestConfig({
        preRouterHook: perms.hook,
    });
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        request: supertest(app),
        stores,
        perms,
    };
}

test('should return seen toggles even when there is nothing', () => {
    expect.assertions(1);
    const { request } = getSetup();
    return request
        .get('/api/admin/metrics/seen-toggles')
        .expect(200)
        .expect(res => {
            expect(res.body).toHaveLength(0);
        });
});

test('should return list of seen-toggles per app', () => {
    expect.assertions(3);
    const { request, stores } = getSetup();
    const appName = 'asd!23';
    stores.clientMetricsStore.emit('metrics', {
        appName,
        instanceId: 'instanceId',
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: {
                toggleX: { yes: 123, no: 0 },
                toggleY: { yes: 123, no: 0 },
            },
        },
    });

    return request
        .get('/api/admin/metrics/seen-toggles')
        .expect(200)
        .expect(res => {
            const seenAppsWithToggles = res.body;
            expect(seenAppsWithToggles.length === 1).toBe(true);
            expect(seenAppsWithToggles[0].appName === appName).toBe(true);
            expect(seenAppsWithToggles[0].seenToggles.length === 2).toBe(true);
        });
});

test('should return feature-toggles metrics even when there is nothing', () => {
    expect.assertions(0);
    const { request } = getSetup();
    return request.get('/api/admin/metrics/feature-toggles').expect(200);
});

test('should return metrics for all toggles', () => {
    expect.assertions(2);
    const { request, stores } = getSetup();
    const appName = 'asd!23';
    stores.clientMetricsStore.emit('metrics', {
        appName,
        instanceId: 'instanceId',
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: {
                toggleX: { yes: 123, no: 0 },
                toggleY: { yes: 123, no: 0 },
            },
        },
    });

    return request
        .get('/api/admin/metrics/feature-toggles')
        .expect(200)
        .expect(res => {
            const metrics = res.body;
            expect(metrics.lastHour !== undefined).toBe(true);
            expect(metrics.lastMinute !== undefined).toBe(true);
        });
});

test('should return empty list of client applications', () => {
    expect.assertions(1);
    const { request } = getSetup();

    return request
        .get('/api/admin/metrics/applications')
        .expect(200)
        .expect(res => {
            expect(res.body.applications.length === 0).toBe(true);
        });
});

test('should return applications', () => {
    expect.assertions(2);
    const { request, stores } = getSetup();
    const appName = '123!23';

    stores.clientApplicationsStore.upsert({ appName });

    return request
        .get('/api/admin/metrics/applications/')
        .expect(200)
        .expect(res => {
            const metrics = res.body;
            expect(metrics.applications.length === 1).toBe(true);
            expect(metrics.applications[0].appName === appName).toBe(true);
        });
});

test('should store application', () => {
    expect.assertions(0);
    const { request } = getSetup();
    const appName = '123!23';

    return request
        .post(`/api/admin/metrics/applications/${appName}`)
        .send({ appName, strategies: ['default'] })
        .expect(202);
});

test('should store application details wihtout strategies', () => {
    expect.assertions(0);
    const { request } = getSetup();
    const appName = '123!23';

    return request
        .post(`/api/admin/metrics/applications/${appName}`)
        .send({ appName, url: 'htto://asd.com' })
        .expect(202);
});

test('should accept a delete call to unknown application', () => {
    expect.assertions(0);
    const { request } = getSetup();
    const appName = 'unknown';

    return request
        .delete(`/api/admin/metrics/applications/${appName}`)
        .expect(200);
});

test('should delete application', () => {
    expect.assertions(0);
    const { request, stores } = getSetup();
    const appName = 'deletable-test';

    stores.clientApplicationsStore.upsert({ appName });

    return request
        .delete(`/api/admin/metrics/applications/${appName}`)
        .expect(200);
});
