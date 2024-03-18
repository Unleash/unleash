import supertest, { type Test } from 'supertest';
import createStores from '../../../../test/fixtures/store';
import getLogger from '../../../../test/fixtures/no-logger';
import getApp from '../../../app';
import { createServices } from '../../../services';
import FeatureController from '../client-feature-toggle.controller';
import { createTestConfig } from '../../../../test/config/test-config';
import { secondsToMilliseconds } from 'date-fns';
import { ClientSpecService } from '../../../services/client-spec-service';
import type { Application } from 'express';
import type { IFlagResolver } from '../../../types';
import type TestAgent from 'supertest/lib/agent';

let app: Application;

async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);

    app = await getApp(config, stores, services);

    return {
        base,
        clientFeatureToggleStore: stores.clientFeatureToggleStore,
        request: supertest(app),
    };
}

const callGetAll = async (controller: FeatureController) => {
    await controller.getAll(
        // @ts-expect-error
        { query: {}, header: () => undefined, headers: {} },
        {
            json: () => {},
            setHeader: () => undefined,
        },
    );
};

let base: string;
let request: TestAgent<Test>;

let flagResolver: Partial<IFlagResolver>;

beforeEach(async () => {
    const setup = await getSetup();
    base = setup.base;
    request = setup.request;
    flagResolver = {
        isEnabled: () => {
            return false;
        },
    };
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
    const getActiveSegmentsForClient = jest.fn().mockReturnValue([]);
    const respondWithValidation = jest.fn().mockReturnValue({});
    const validPath = jest.fn().mockReturnValue(jest.fn());
    const clientSpecService = new ClientSpecService({ getLogger });
    const openApiService = { respondWithValidation, validPath };
    const clientFeatureToggleService = {
        getClientFeatures,
        getActiveSegmentsForClient,
    };
    const featureToggleService = { getClientFeatures };
    const configurationRevisionService = { getMaxRevisionId: () => 1 };

    const controller = new FeatureController(
        {
            clientSpecService,
            // @ts-expect-error due to partial implementation
            openApiService,
            // @ts-expect-error due to partial implementation
            clientFeatureToggleService,
            // @ts-expect-error due to partial implementation
            featureToggleService,
            // @ts-expect-error due to partial implementation
            configurationRevisionService,
        },
        {
            getLogger,
            clientFeatureCaching: {
                enabled: true,
                maxAge: secondsToMilliseconds(10),
            },
            flagResolver,
        },
    );

    await callGetAll(controller);
    await callGetAll(controller);
    expect(getClientFeatures).toHaveBeenCalledTimes(1);
});

test('if caching is not enabled all calls goes to service', async () => {
    const getClientFeatures = jest.fn().mockReturnValue([]);
    const getActiveSegmentsForClient = jest.fn().mockReturnValue([]);
    const respondWithValidation = jest.fn().mockReturnValue({});
    const validPath = jest.fn().mockReturnValue(jest.fn());
    const clientSpecService = new ClientSpecService({ getLogger });
    const clientFeatureToggleService = {
        getClientFeatures,
        getActiveSegmentsForClient,
    };
    const featureToggleService = { getClientFeatures };
    const openApiService = { respondWithValidation, validPath };
    const configurationRevisionService = { getMaxRevisionId: () => 1 };

    const controller = new FeatureController(
        {
            clientSpecService,
            // @ts-expect-error due to partial implementation
            openApiService,
            // @ts-expect-error due to partial implementation
            clientFeatureToggleService,
            // @ts-expect-error due to partial implementation
            featureToggleService,
            // @ts-expect-error due to partial implementation
            configurationRevisionService,
        },
        {
            getLogger,
            clientFeatureCaching: {
                enabled: false,
                maxAge: secondsToMilliseconds(10),
            },
            flagResolver,
        },
    );

    await callGetAll(controller);
    await callGetAll(controller);
    expect(getClientFeatures).toHaveBeenCalledTimes(2);
});
