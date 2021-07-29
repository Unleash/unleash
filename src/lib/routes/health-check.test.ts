import supertest from 'supertest';
import { EventEmitter } from 'events';
import { createServices } from '../services';
import { createTestConfig } from '../../test/config/test-config';

import createStores from '../../test/fixtures/store';
import getLogger from '../../test/fixtures/no-logger';
import getApp from '../app';
import { IUnleashStores } from '../types';

const eventBus = new EventEmitter();

function getSetup() {
    const stores = createStores();
    const config = createTestConfig();
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        request: supertest(app),
        stores,
        destroy: () => {
            services.versionService.destroy();
            services.clientMetricsService.destroy();
            services.apiTokenService.destroy();
        },
    };
}
let request;
let destroy;
let stores;
beforeEach(() => {
    const setup = getSetup();
    request = setup.request;
    destroy = setup.destroy;
    stores = setup.stores;
});

afterEach(() => {
    destroy();
    getLogger.setMuteError(false);
});

test('should give 500 when db is failing', () => {
    const config = createTestConfig();
    const failingStores: Partial<IUnleashStores> = {
        // @ts-ignore
        featureTypeStore: {
            getAll: () => Promise.reject(new Error('db error')),
        },
        clientMetricsStore: {
            // @ts-ignore
            on: () => {},
        },
    };
    // @ts-ignore
    const services = createServices(failingStores, config);
    // @ts-ignore
    const app = getApp(createTestConfig(), failingStores, services, eventBus);
    request = supertest(app);
    getLogger.setMuteError(true);
    expect.assertions(2);
    stores.featureToggleStore.getAll = () =>
        Promise.reject(new Error('db error'));
    return request
        .get('/health')
        .expect(500)
        .expect((res) => {
            expect(res.status).toBe(500);
            expect(res.body.health).toBe('BAD');
        });
});

test('should give 200 when db is not failing', () => {
    expect.assertions(0);
    return request.get('/health').expect(200);
});

test('should give health=GOOD when db is not failing', () => {
    expect.assertions(2);
    return request
        .get('/health')
        .expect(200)
        .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.body.health).toBe('GOOD');
        });
});
