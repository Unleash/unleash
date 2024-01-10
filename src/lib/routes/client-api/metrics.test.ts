import supertest from 'supertest';
import getApp from '../../app';
import { createTestConfig } from '../../../test/config/test-config';
import { clientMetricsSchema } from '../../services/client-metrics/schema';
import { createServices } from '../../services';
import { IUnleashOptions, IUnleashServices, IUnleashStores } from '../../types';
import dbInit from '../../../test/e2e/helpers/database-init';
import { subHours, subMinutes } from 'date-fns';

let db;

async function getSetup(opts?: IUnleashOptions) {
    const config = createTestConfig(opts);
    db = await dbInit('metrics', config.getLogger);

    const services = createServices(db.stores, config, db.rawDatabase);
    const app = await getApp(config, db.stores, services);
    return {
        request: supertest(app),
        stores: db.stores,
        services,
        destroy: db.destroy,
    };
}

let request;
let stores: IUnleashStores;
let services: IUnleashServices;
let destroy;

beforeAll(async () => {
    const setup = await getSetup();
    request = setup.request;
    stores = setup.stores;
    destroy = setup.destroy;
    services = setup.services;
});

afterAll(() => {
    destroy();
});

afterEach(async () => {
    await stores.featureToggleStore.deleteAll();
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

test('should return a 400 when required fields are missing', async () => {
    stores.featureToggleStore.create('default', {
        name: 'toggleLastSeen',
        createdByUserId: 9999,
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
        name: 'theOtherToggleLastSeen',
        createdByUserId: 9999,
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
                    theOtherToggleLastSeen: {
                        yes: 200,
                        no: 0,
                    },
                },
            },
        })
        .expect(202);
});

test('should return 204 if metrics are disabled by feature flag', async () => {
    const { request: localRequest } = await getSetup({
        experimental: {
            flags: {
                disableMetrics: true,
            },
        },
    });

    await localRequest
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
        .expect(204);
});

describe('bulk metrics', () => {
    test('filters out metrics for environments we do not have access for. No auth setup so we can only access default env', async () => {
        const timer = new Date().valueOf();
        await request
            .post('/api/client/metrics/bulk')
            .send({
                applications: [],
                metrics: [
                    {
                        featureName: 'test_feature_one',
                        appName: 'test_application',
                        environment: 'default',
                        timestamp: subMinutes(Date.now(), 3),
                        yes: 1000,
                        no: 800,
                        variants: {},
                    },
                    {
                        featureName: 'test_feature_two',
                        appName: 'test_application',
                        environment: 'development',
                        timestamp: subMinutes(Date.now(), 3),
                        yes: 1000,
                        no: 800,
                        variants: {},
                    },
                ],
            })
            .expect(202);
        console.log(
            `Posting happened ${new Date().valueOf() - timer} ms after`,
        );
        await services.clientMetricsServiceV2.bulkAdd(); // Force bulk collection.
        console.log(
            `Bulk add happened ${new Date().valueOf() - timer} ms after`,
        );
        const developmentReport =
            await services.clientMetricsServiceV2.getClientMetricsForToggle(
                'test_feature_two',
                1,
            );
        console.log(
            `Getting for toggle two ${new Date().valueOf() - timer} ms after`,
        );
        const defaultReport =
            await services.clientMetricsServiceV2.getClientMetricsForToggle(
                'test_feature_one',
                1,
            );
        console.log(
            `Getting for toggle one ${new Date().valueOf() - timer} ms after`,
        );
        expect(developmentReport).toHaveLength(0);
        expect(defaultReport).toHaveLength(1);
        expect(defaultReport[0].yes).toBe(1000);
    });

    test('should accept empty bulk metrics', async () => {
        await request
            .post('/api/client/metrics/bulk')
            .send({
                applications: [],
                metrics: [],
            })
            .expect(202);
    });

    test('should validate bulk metrics data', async () => {
        await request
            .post('/api/client/metrics/bulk')
            .send({ randomData: 'blurb' })
            .expect(400);
    });

    test('bulk metrics should return 204 if metrics are disabled', async () => {
        const { request: localRequest } = await getSetup({
            experimental: {
                flags: {
                    disableMetrics: true,
                },
            },
        });

        await localRequest
            .post('/api/client/metrics/bulk')
            .send({
                applications: [],
                metrics: [],
            })
            .expect(204);
    });
});
