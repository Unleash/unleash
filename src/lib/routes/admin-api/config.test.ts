import supertest from 'supertest';
import { EventEmitter } from 'events';
import { createTestConfig } from '../../../test/config/test-config';

import createStores from '../../../test/fixtures/store';
import getApp from '../../app';
import { createServices } from '../../services';

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
    const stores = createStores();
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

let request;
let base;
let destroy;

beforeEach(() => {
    const setup = getSetup();
    request = setup.request;
    base = setup.base;
    destroy = setup.destroy;
});

afterEach(() => {
    destroy();
});
test('should get ui config', () => {
    expect.assertions(2);
    return request
        .get(`${base}/api/admin/ui-config`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.slogan === 'hello').toBe(true);
            expect(res.body.headerBackground === 'red').toBe(true);
        });
});
