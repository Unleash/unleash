import supertest, { type Test } from 'supertest';
import { createTestConfig } from '../../../test/config/test-config';

import createStores from '../../../test/fixtures/store';
import getApp from '../../app';
import { createServices } from '../../services';
import {
    DEFAULT_SEGMENT_VALUES_LIMIT,
    DEFAULT_STRATEGY_SEGMENTS_LIMIT,
} from '../../util/segments';
import type TestAgent from 'supertest/lib/agent';
import type { IUnleashStores } from '../../types';

const uiConfig = {
    headerBackground: 'red',
    slogan: 'hello',
};

async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const config = createTestConfig({
        experimental: {
            flags: {
                granularAdminPermissions: true,
            },
        },
        server: { baseUriPath: base },
        ui: uiConfig,
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
let stores: IUnleashStores;

beforeEach(async () => {
    const setup = await getSetup();
    request = setup.request;
    base = setup.base;
    stores = setup.stores;
});

test('should get ui config', async () => {
    const { body } = await request
        .get(`${base}/api/admin/ui-config`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.slogan).toEqual('hello');
    expect(body.headerBackground).toEqual('red');
    expect(body.segmentValuesLimit).toEqual(DEFAULT_SEGMENT_VALUES_LIMIT);
    expect(body.strategySegmentsLimit).toEqual(DEFAULT_STRATEGY_SEGMENTS_LIMIT);
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
