import supertest from 'supertest';
import { EventEmitter } from 'events';
import createStores from '../../../test/fixtures/store';
import getApp from '../../app';
import { createTestConfig } from '../../../test/config/test-config';
import { clientMetricsSchema } from '../../services/client-metrics/client-metrics-schema';
import { createServices } from '../../services';

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
let stores;
let destroy;

beforeEach(() => {
    const setup = getSetup();
    request = setup.request;
    stores = setup.stores;
    destroy = setup.destroy;
});

afterEach(() => {
    destroy();
});

test('should validate client metrics', () => {
    expect.assertions(0);
    return request
        .post('/api/client/metrics')
        .send({ random: 'blush' })
        .expect(400);
});

test('should accept empty client metrics', () => {
    expect.assertions(0);
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {},
            },
        })
        .expect(202);
});

test('should accept client metrics with yes/no', () => {
    expect.assertions(0);
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {
                    toggleA: {
                        yes: 200,
                        no: 0,
                    },
                },
            },
        })
        .expect(202);
});

test('should accept client metrics with variants', () => {
    expect.assertions(0);
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {
                    toggleA: {
                        yes: 200,
                        no: 0,
                        variants: {
                            variant1: 1,
                            variant2: 2,
                        },
                    },
                },
            },
        })
        .expect(202);
});

test('should accept client metrics without yes/no', () => {
    expect.assertions(0);
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {
                    toggleA: {
                        blue: 200,
                        green: 0,
                    },
                },
            },
        })
        .expect(202);
});

test('shema allow empty strings', () => {
    const data = {
        appName: 'java-test',
        instanceId: 'instance y',
        bucket: {
            toggles: { Demo2: { yes: '', no: '', variants: {} } },
            start: '2019-05-06T08:30:40.514Z',
            stop: '2019-05-06T09:30:50.515Z',
        },
    };
    const { error, value } = clientMetricsSchema.validate(data);
    expect(error).toBeFalsy();
    expect(value.bucket.toggles.Demo2.yes).toBe(0);
    expect(value.bucket.toggles.Demo2.no).toBe(0);
});

test('schema allow yes=<string nbr>', () => {
    const data = {
        appName: 'java-test',
        instanceId: 'instance y',
        bucket: {
            toggles: { Demo2: { yes: '12', no: 256, variants: {} } },
            start: '2019-05-06T08:30:40.514Z',
            stop: '2019-05-06T09:30:50.515Z',
        },
    };
    const { error, value } = clientMetricsSchema.validate(data);
    expect(error).toBeFalsy();
    expect(value.bucket.toggles.Demo2.yes).toBe(12);
    expect(value.bucket.toggles.Demo2.no).toBe(256);
});

test('should set lastSeen on toggle', async () => {
    expect.assertions(1);
    stores.featureToggleStore.createFeature('default', {
        name: 'toggleLastSeen',
    });
    await request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {
                    toggleLastSeen: {
                        yes: 200,
                        no: 0,
                    },
                },
            },
        })
        .expect(202);

    const toggle = await stores.featureToggleStore.get('toggleLastSeen');

    expect(toggle.lastSeenAt).toBeTruthy();
});
