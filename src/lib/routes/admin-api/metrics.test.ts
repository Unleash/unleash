import supertest from 'supertest';
import { EventEmitter } from 'events';
import createStores from '../../../test/fixtures/store';
import permissions from '../../../test/fixtures/permissions';
import getApp from '../../app';
import { createTestConfig } from '../../../test/config/test-config';
import { createServices } from '../../services';

const eventBus = new EventEmitter();

function getSetup() {
    const stores = createStores();
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
        destroy: () => {
            services.versionService.destroy();
            services.clientMetricsService.destroy();
            services.apiTokenService.destroy();
        },
    };
}

let stores;
let request;
let destroy;

beforeEach(() => {
    const setup = getSetup();
    stores = setup.stores;
    request = setup.request;
    destroy = setup.destroy;
});

afterEach(() => {
    destroy();
});

test('should return seen toggles even when there is nothing', () => {
    expect.assertions(1);
    return request
        .get('/api/admin/metrics/seen-toggles')
        .expect(200)
        .expect((res) => {
            expect(res.body.length === 0).toBe(true);
        });
});

test('should return list of seen-toggles per app', () => {
    expect.assertions(3);
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
        .expect((res) => {
            const seenAppsWithToggles = res.body;
            expect(seenAppsWithToggles.length === 1).toBe(true);
            expect(seenAppsWithToggles[0].appName === appName).toBe(true);
            expect(seenAppsWithToggles[0].seenToggles.length === 2).toBe(true);
        });
});

test('should return feature-toggles metrics even when there is nothing', () => {
    expect.assertions(0);
    return request.get('/api/admin/metrics/feature-toggles').expect(200);
});

test('should return metrics for all toggles', () => {
    expect.assertions(2);
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
        .expect((res) => {
            const metrics = res.body;
            expect(metrics.lastHour !== undefined).toBe(true);
            expect(metrics.lastMinute !== undefined).toBe(true);
        });
});

test('should return empty list of client applications', () => {
    expect.assertions(1);

    return request
        .get('/api/admin/metrics/applications')
        .expect(200)
        .expect((res) => {
            expect(res.body.applications.length === 0).toBe(true);
        });
});

test('should return applications', () => {
    expect.assertions(2);
    const appName = '123!23';

    stores.clientApplicationsStore.upsert({ appName });

    return request
        .get('/api/admin/metrics/applications/')
        .expect(200)
        .expect((res) => {
            const metrics = res.body;
            expect(metrics.applications.length === 1).toBe(true);
            expect(metrics.applications[0].appName === appName).toBe(true);
        });
});

test('should store application', () => {
    expect.assertions(0);
    const appName = '123!23';

    return request
        .post(`/api/admin/metrics/applications/${appName}`)
        .send({ appName, strategies: ['default'] })
        .expect(202);
});

test('should store application details wihtout strategies', () => {
    expect.assertions(0);
    const appName = '123!23';

    return request
        .post(`/api/admin/metrics/applications/${appName}`)
        .send({ appName, url: 'htto://asd.com' })
        .expect(202);
});

test('should accept a delete call to unknown application', () => {
    expect.assertions(0);
    const appName = 'unknown';

    return request
        .delete(`/api/admin/metrics/applications/${appName}`)
        .expect(200);
});

test('should delete application', () => {
    expect.assertions(0);
    const appName = 'deletable-test';

    stores.clientApplicationsStore.upsert({ appName });

    return request
        .delete(`/api/admin/metrics/applications/${appName}`)
        .expect(200);
});
