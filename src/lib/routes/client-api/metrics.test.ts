import supertest from 'supertest';
import createStores from '../../../test/fixtures/store';
import getApp from '../../app';
import { createTestConfig } from '../../../test/config/test-config';
import { clientMetricsSchema } from '../../services/client-metrics/schema';
import { createServices } from '../../services';
import { IUnleashOptions, IUnleashServices, IUnleashStores } from '../../types';

async function getSetup(opts?: IUnleashOptions) {
    const stores = createStores();

    const config = createTestConfig(opts);
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);

    return {
        request: supertest(app),
        stores,
        services,
        destroy: () => {
            services.versionService.destroy();
            services.clientInstanceService.destroy();
            services.apiTokenService.destroy();
        },
    };
}

let request;
let stores: IUnleashStores;
let services: IUnleashServices;
let destroy;

beforeEach(async () => {
    const setup = await getSetup();
    request = setup.request;
    stores = setup.stores;
    destroy = setup.destroy;
    services = setup.services;
});

afterEach(() => {
    destroy();
});

test('should validate client metrics', () => {
    return request
        .post('/api/client/metrics')
        .send({ random: 'blush' })
        .expect(400);
});

test('should accept empty client metrics', () => {
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

test('should accept client metrics with yes/no with metricsV2', async () => {
    const testRunner = await getSetup();
    await testRunner.request
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

    testRunner.destroy();
});

test('should accept client metrics with variants', () => {
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

test('schema allow empty strings', () => {
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
    stores.featureToggleStore.create('default', {
        name: 'toggleLastSeen',
    });
    await request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
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

    await services.lastSeenService.store();
    const toggle = await stores.featureToggleStore.get('toggleLastSeen');

    expect(toggle.lastSeenAt).toBeTruthy();
});

test('should return a 400 when required fields are missing', async () => {
    stores.featureToggleStore.create('default', {
        name: 'toggleLastSeen',
    });
    await request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            bucket: {
                start: Date.now(),
                toggles: {
                    toggleLastSeen: {
                        yes: 200,
                        no: 0,
                    },
                },
            },
        })
        .expect(400);
});

test('should return a 200 if required fields are there', async () => {
    stores.featureToggleStore.create('default', {
        name: 'toggleLastSeen',
    });
    await request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            someParam: 'some-value',
            somOtherParam: 'some--other-value',
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
});
