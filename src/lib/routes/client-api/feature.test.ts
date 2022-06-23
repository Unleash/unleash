import supertest from 'supertest';
import createStores from '../../../test/fixtures/store';
import getLogger from '../../../test/fixtures/no-logger';
import getApp from '../../app';
import { createServices } from '../../services';
import FeatureController from './feature';
import { createTestConfig } from '../../../test/config/test-config';
import { secondsToMilliseconds } from 'date-fns';
import { ClientSpecService } from '../../services/client-spec-service';

async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);

    const app = await getApp(config, stores, services);

    return {
        base,
        featureToggleStore: stores.featureToggleStore,
        featureToggleClientStore: stores.featureToggleClientStore,
        request: supertest(app),
        destroy: () => {
            services.versionService.destroy();
            services.clientInstanceService.destroy();
            services.apiTokenService.destroy();
        },
    };
}

const callGetAll = async (controller: FeatureController) => {
    await controller.getAll(
        // @ts-expect-error
        { query: {}, header: () => undefined },
        { json: () => {} },
    );
};

let base;
let request;
let destroy;
let featureToggleClientStore;

beforeEach(async () => {
    const setup = await getSetup();
    base = setup.base;
    request = setup.request;
    featureToggleClientStore = setup.featureToggleClientStore;
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
    const getActive = jest.fn().mockReturnValue([]);
    const respondWithValidation = jest.fn().mockReturnValue({});
    const validPath = jest.fn().mockReturnValue(jest.fn());
    const clientSpecService = new ClientSpecService({ getLogger });
    const openApiService = { respondWithValidation, validPath };
    const featureToggleServiceV2 = { getClientFeatures };
    const segmentService = { getActive };

    const controller = new FeatureController(
        {
            clientSpecService,
            // @ts-expect-error
            openApiService,
            // @ts-expect-error
            featureToggleServiceV2,
            // @ts-expect-error
            segmentService,
        },
        {
            getLogger,
            clientFeatureCaching: {
                enabled: true,
                maxAge: secondsToMilliseconds(10),
            },
        },
    );

    await callGetAll(controller);
    await callGetAll(controller);
    expect(getClientFeatures).toHaveBeenCalledTimes(1);
});

test('if caching is not enabled all calls goes to service', async () => {
    const getClientFeatures = jest.fn().mockReturnValue([]);
    const getActive = jest.fn().mockReturnValue([]);
    const respondWithValidation = jest.fn().mockReturnValue({});
    const validPath = jest.fn().mockReturnValue(jest.fn());
    const clientSpecService = new ClientSpecService({ getLogger });
    const featureToggleServiceV2 = { getClientFeatures };
    const segmentService = { getActive };
    const openApiService = { respondWithValidation, validPath };

    const controller = new FeatureController(
        {
            clientSpecService,
            // @ts-expect-error
            openApiService,
            // @ts-expect-error
            featureToggleServiceV2,
            // @ts-expect-error
            segmentService,
        },
        {
            getLogger,
            clientFeatureCaching: {
                enabled: false,
                maxAge: secondsToMilliseconds(10),
            },
        },
    );

    await callGetAll(controller);
    await callGetAll(controller);
    expect(getClientFeatures).toHaveBeenCalledTimes(2);
});

test('fetch single feature', async () => {
    expect.assertions(1);
    await featureToggleClientStore.createFeature({
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
    await featureToggleClientStore.createFeature({ name: 'a_test1' });
    await featureToggleClientStore.createFeature({ name: 'a_test2' });
    await featureToggleClientStore.createFeature({ name: 'b_test1' });
    await featureToggleClientStore.createFeature({ name: 'b_test2' });

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
    await featureToggleClientStore.createFeature({
        name: 'a_test1',
        project: 'projecta',
    });
    await featureToggleClientStore.createFeature({
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
