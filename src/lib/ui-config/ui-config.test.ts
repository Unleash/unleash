import supertest, { type Test } from 'supertest';
import { createTestConfig } from '../../test/config/test-config.js';

import createStores from '../../test/fixtures/store.js';
import getApp from '../app.js';
import { createServices } from '../services/index.js';
import {
    DEFAULT_SEGMENT_VALUES_LIMIT,
    DEFAULT_STRATEGY_SEGMENTS_LIMIT,
} from '../util/segments.js';
import type TestAgent from 'supertest/lib/agent.d.ts';
import type { IUnleashStores, IUser } from '../types/index.js';
import { hashValue } from '../util/anonymise.js';
import { ADMIN } from '../types/permissions.js';

const uiConfig = {
    headerBackground: 'red',
    slogan: 'hello',
};

async function getSetup(user?: Partial<IUser>) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const config = createTestConfig({
        server: {
            baseUriPath: base,
            edgeUrl: 'https://yourcompany.edge.getunleash.io',
        },
        ui: uiConfig,
        preHook: user
            ? (app) => {
                  app.use((req, _res, next) => {
                      req.user = user;
                      next();
                  });
              }
            : undefined,
    });
    const stores = createStores();
    const services = createServices(stores, config);

    const app = await getApp(config, stores, services);

    return {
        base,
        stores,
        request: supertest(app),
    };
}

let request: TestAgent<Test>;
let base: string;
let _stores: IUnleashStores;

beforeEach(async () => {
    const setup = await getSetup({
        isAPI: true,
        id: 7,
        email: 'someone@example.com',
        permissions: [ADMIN],
    });
    request = setup.request;
    base = setup.base;
    _stores = setup.stores;
});

test('should get ui config', async () => {
    const { body } = await request
        .get(`${base}/api/admin/ui-config`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.slogan).toEqual('hello');
    expect(body.headerBackground).toEqual('red');
    expect(body.resourceLimits!.segmentValues).toEqual(
        DEFAULT_SEGMENT_VALUES_LIMIT,
    );
    expect(body.resourceLimits!.strategySegments).toEqual(
        DEFAULT_STRATEGY_SEGMENTS_LIMIT,
    );
    expect(body.edgeUrl).toEqual('https://yourcompany.edge.getunleash.io');
    expect(body.impactMetrics).toBe('disabled');
    expect(body.unleashContext).toMatchObject({
        userId: 7,
        email: hashValue('someone@example.com'),
    });
});

test('should update CORS settings', async () => {
    const { body } = await request
        .get(`${base}/api/admin/ui-config`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.frontendApiOrigins).toEqual(['*']);

    await request
        .post(`${base}/api/admin/ui-config/cors`)
        .send({
            frontendApiOrigins: ['https://example.com'],
        })
        .expect(204);

    const { body: updatedBody } = await request
        .get(`${base}/api/admin/ui-config`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(updatedBody.frontendApiOrigins).toEqual(['https://example.com']);
});
