import supertest from 'supertest';
import { EventEmitter } from 'events';
import createStores from '../../../test/fixtures/store';
import getLogger from '../../../test/fixtures/no-logger';
import getApp from '../../app';
import { createServices } from '../../services';
import FeatureController from './feature';
import { createTestConfig } from '../../../test/config/test-config';

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
        featureToggleStore: stores.featureToggleStore,
        featureStrategiesStore: stores.featureStrategiesStore,
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
let featureStrategiesStore;

beforeEach(() => {
    const setup = getSetup();
    base = setup.base;
    request = setup.request;
    featureStrategiesStore = setup.featureStrategiesStore;
    destroy = setup.destroy;
});

afterEach(() => {
    destroy();
});

test('should get empty getFeatures via client', () => {
    expect.assertions(1);
    return request
        .get(`${base}/api/client/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features.length === 0).toBe(true);
        });
});

test('if caching is enabled should memoize', async () => {
    const getClientFeatures = jest.fn().mockReturnValue([]);

    const featureToggleServiceV2 = {
        getClientFeatures,
    };
    const controller = new FeatureController(
        // @ts-ignore
        { featureToggleServiceV2 },
        {
            getLogger,
            experimental: {
                clientFeatureMemoize: {
                    enabled: true,
                    maxAge: 10000,
                },
            },
        },
    );
    // @ts-ignore
    await controller.getAll({ query: {} }, { json: () => {} });
    // @ts-ignore
    await controller.getAll({ query: {} }, { json: () => {} });
    expect(getClientFeatures).toHaveBeenCalledTimes(1);
});

test('if caching is not enabled all calls goes to service', async () => {
    const getClientFeatures = jest.fn().mockReturnValue([]);

    const featureToggleServiceV2 = {
        getClientFeatures,
    };
    const controller = new FeatureController(
        // @ts-ignore
        { featureToggleServiceV2 },
        {
            getLogger,
            experimental: {
                clientFeatureMemoize: {
                    enabled: false,
                    maxAge: 10000,
                },
            },
        },
    );
    // @ts-ignore
    await controller.getAll({ query: {} }, { json: () => {} });
    // @ts-ignore
    await controller.getAll({ query: {} }, { json: () => {} });
    expect(getClientFeatures).toHaveBeenCalledTimes(2);
});

test('fetch single feature', async () => {
    expect.assertions(1);
    await featureStrategiesStore.createFeature({
        name: 'test_',
        strategies: [{ name: 'default' }],
    });

    return request
        .get(`${base}/api/client/features/test_`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.name === 'test_').toBe(true);
        });
});

test('support name prefix', async () => {
    expect.assertions(2);
    await featureStrategiesStore.createFeature({ name: 'a_test1' });
    await featureStrategiesStore.createFeature({ name: 'a_test2' });
    await featureStrategiesStore.createFeature({ name: 'b_test1' });
    await featureStrategiesStore.createFeature({ name: 'b_test2' });

    const namePrefix = 'b_';

    return request
        .get(`${base}/api/client/features?namePrefix=${namePrefix}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features.length).toBe(2);
            expect(res.body.features[1].name).toBe('b_test2');
        });
});

test('support filtering on project', async () => {
    expect.assertions(2);
    await featureStrategiesStore.createFeature({
        name: 'a_test1',
        project: 'projecta',
    });
    await featureStrategiesStore.createFeature({
        name: 'b_test2',
        project: 'projectb',
    });
    return request
        .get(`${base}/api/client/features?project=projecta`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
            expect(res.body.features[0].name).toBe('a_test1');
        });
});
