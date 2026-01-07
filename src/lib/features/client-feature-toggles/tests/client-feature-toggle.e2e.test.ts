import supertest, { type Test } from 'supertest';
import createStores from '../../../../test/fixtures/store.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import getApp from '../../../app.js';
import { createServices } from '../../../services/index.js';
import FeatureController from '../client-feature-toggle.controller.js';
import { createTestConfig } from '../../../../test/config/test-config.js';
import { secondsToMilliseconds } from 'date-fns';
import { ClientSpecService } from '../../../services/client-spec-service.js';
import type { Application } from 'express';
import type { IFlagResolver } from '../../../types/index.js';
import type TestAgent from 'supertest/lib/agent.d.ts';

import { vi } from 'vitest';

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
        getVariant: () => {
            return {
                name: 'disabled',
                feature_enabled: false,
                enabled: false,
            };
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
    const getClientFeatures = vi.fn().mockReturnValue([]);
    const getActiveSegmentsForClient = vi.fn().mockReturnValue([]);
    const respondWithValidation = vi.fn().mockReturnValue({});
    const validPath = vi.fn().mockReturnValue(vi.fn());
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
    const getClientFeatures = vi.fn().mockReturnValue([]);
    const getActiveSegmentsForClient = vi.fn().mockReturnValue([]);
    const respondWithValidation = vi.fn().mockReturnValue({});
    const validPath = vi.fn().mockReturnValue(vi.fn());
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
