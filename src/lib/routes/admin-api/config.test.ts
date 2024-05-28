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

describe('displayUpgradeEdgeBanner', () => {
    test('ui config should have displayUpgradeEdgeBanner to be set if an instance using edge has been seen', async () => {
        await stores.clientInstanceStore.insert({
            appName: 'my-app',
            instanceId: 'some-instance',
            sdkVersion: 'unleash-edge:16.0.0',
        });
        const { body } = await request
            .get(`${base}/api/admin/ui-config`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(body.flags).toBeTruthy();
        expect(body.flags.displayUpgradeEdgeBanner).toBeTruthy();
    });
    test('ui config should not get displayUpgradeEdgeBanner flag if edge >= 19.1.3 has been seen', async () => {
        await stores.clientInstanceStore.insert({
            appName: 'my-app',
            instanceId: 'some-instance',
            sdkVersion: 'unleash-edge:19.1.4',
        });
        const { body } = await request
            .get(`${base}/api/admin/ui-config`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(body.flags).toBeTruthy();
        expect(body.flags.displayUpgradeEdgeBanner).toEqual(false);
    });
    test('ui config should not get displayUpgradeEdgeBanner flag if java-client has been seen', async () => {
        await stores.clientInstanceStore.insert({
            appName: 'my-app',
            instanceId: 'some-instance',
            sdkVersion: 'unleash-client-java:9.1.0',
        });
        const { body } = await request
            .get(`${base}/api/admin/ui-config`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(body.flags).toBeTruthy();
        expect(body.flags.displayUpgradeEdgeBanner).toEqual(false);
    });
});
