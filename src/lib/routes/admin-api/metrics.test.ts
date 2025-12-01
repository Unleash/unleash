import supertest, { type Test } from 'supertest';
import createStores from '../../../test/fixtures/store.js';
import permissions from '../../../test/fixtures/permissions.js';
import getApp from '../../app.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import { createServices } from '../../services/index.js';
import type { IUnleashStores } from '../../types/index.js';
import type TestAgent from 'supertest/lib/agent.d.ts';

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
        config,
    };
}

let stores: IUnleashStores;
let request: TestAgent<Test>;

beforeEach(async () => {
    const setup = await getSetup();
    stores = setup.stores;
    request = setup.request;
});

test('/api/admin/metrics/seen-toggles is deprecated', () => {
    return request.get('/api/admin/metrics/seen-toggles').expect(410);
});

test('/api/admin/metrics/feature-flags is deprecated', () => {
    return request.get('/api/admin/metrics/feature-flags').expect(410);
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

test('should store application coming from edit application form', () => {
    expect.assertions(0);
    const appName = '123!23';

    return request
        .post(`/api/admin/metrics/applications/${appName}`)
        .send({
            url: 'http://test.com',
            description: 'This is an optional description',
            icon: 'arrow-down',
        })
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
