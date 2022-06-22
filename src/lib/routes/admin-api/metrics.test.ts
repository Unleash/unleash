import supertest from 'supertest';
import createStores from '../../../test/fixtures/store';
import permissions from '../../../test/fixtures/permissions';
import getApp from '../../app';
import { createTestConfig } from '../../../test/config/test-config';
import { createServices } from '../../services';

async function getSetup() {
    const stores = createStores();
    const perms = permissions();
    const config = createTestConfig({
        preRouterHook: perms.hook,
    });
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);

    return {
        request: supertest(app),
        stores,
        perms,
        destroy: () => {
            services.versionService.destroy();
            services.clientInstanceService.destroy();
            services.apiTokenService.destroy();
        },
    };
}

let stores;
let request;
let destroy;

beforeEach(async () => {
    const setup = await getSetup();
    stores = setup.stores;
    request = setup.request;
    destroy = setup.destroy;
});

afterEach(() => {
    destroy();
});

test('/api/admin/metrics/seen-toggles is deprecated', () => {
    return request.get('/api/admin/metrics/seen-toggles').expect(410);
});

test('/api/admin/metrics/feature-toggles is deprecated', () => {
    return request.get('/api/admin/metrics/feature-toggles').expect(410);
});

test('should return empty list of client applications', () => {
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

test('should store application details without strategies', () => {
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
