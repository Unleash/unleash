import supertest from 'supertest';
import { EventEmitter } from 'events';
import { createTestConfig } from '../../test/config/test-config';
import createStores from '../../test/fixtures/store';
import getApp from '../app';
import { createServices } from '../services';

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        base,
        request: supertest(app),
        destroy: () => {
            services.versionService.destroy();
            services.clientMetricsService.destroy();
            services.apiTokenService.destroy();
        },
    };
}

let base;
let request;
let destroy;
beforeEach(() => {
    const setup = getSetup();
    base = setup.base;
    request = setup.request;
    destroy = setup.destroy;
});

afterEach(() => {
    destroy();
});

test('api definition', () => {
    expect.assertions(5);
    return request
        .get(`${base}/api/`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toBeTruthy();
            const { admin, client } = res.body.links;
            expect(admin.uri === '/api/admin').toBe(true);
            expect(client.uri === '/api/client').toBe(true);
            expect(
                admin.links['feature-toggles'].uri === '/api/admin/features',
            ).toBe(true);
            expect(client.links.metrics.uri === '/api/client/metrics').toBe(
                true,
            );
        });
});

test('admin api defintion', () => {
    expect.assertions(2);
    return request
        .get(`${base}/api/admin`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toBeTruthy();
            expect(
                res.body.links['feature-toggles'].uri === '/api/admin/features',
            ).toBe(true);
        });
});

test('client api defintion', () => {
    expect.assertions(2);
    return request
        .get(`${base}/api/client`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toBeTruthy();
            expect(res.body.links.metrics.uri === '/api/client/metrics').toBe(
                true,
            );
        });
});
