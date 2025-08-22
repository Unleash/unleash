import supertest, { type Test } from 'supertest';
import getApp from '../../../app.js';
import { createTestConfig } from '../../../../test/config/test-config.js';
import { clientMetricsSchema } from '../shared/schema.js';
import {
    type IUnleashServices,
    createServices,
} from '../../../services/index.js';
import {
    IAuthType,
    type IUnleashConfig,
    type IUnleashOptions,
    type IUnleashStores,
} from '../../../types/index.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import { startOfHour } from 'date-fns';
import { ApiTokenType } from '../../../types/model.js';
import type TestAgent from 'supertest/lib/agent.d.ts';
import type { BulkRegistrationSchema } from '../../../openapi/index.js';
import { DEFAULT_ENV } from '../../../server-impl.js';

let db: ITestDb;
let config: IUnleashConfig;

async function getSetup(opts?: IUnleashOptions) {
    config = createTestConfig(opts);
    db = await dbInit('metrics', config.getLogger);

    const services = createServices(db.stores, config, db.rawDatabase);
    const app = await getApp(config, db.stores, services);
    return {
        request: supertest(app),
        stores: db.stores,
        services,
        db: db.rawDatabase,
        destroy: db.destroy,
    };
}

let request: TestAgent<Test>;
let stores: IUnleashStores;
let services: IUnleashServices;
let destroy: () => Promise<void>;

beforeAll(async () => {
    const setup = await getSetup();
    request = setup.request;
    stores = setup.stores;
    destroy = setup.destroy;
    services = setup.services;
});

afterAll(async () => {
    await destroy();
});

afterEach(async () => {
    await stores.featureToggleStore.deleteAll();
    await stores.clientApplicationsStore.deleteAll();
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
    test('should separate frontend applications and backend applications', async () => {
        const frontendApp: BulkRegistrationSchema = {
            appName: 'application-name',
            instanceId: 'browser',
            environment: 'development',
            sdkVersion: 'unleash-client-js:1.0.0',
            sdkType: 'frontend',
        };
        const backendApp: BulkRegistrationSchema = {
            appName: 'application-name',
            instanceId: 'instance1234',
            environment: 'development',
            sdkVersion: 'unleash-client-node',
            sdkType: 'backend',
            started: '1952-03-11T12:00:00.000Z',
            interval: 15000,
        };
        const defaultApp: BulkRegistrationSchema = {
            appName: 'application-name',
            instanceId: 'instance5678',
            environment: 'development',
            sdkVersion: 'unleash-client-java',
            sdkType: null,
            started: '1952-03-11T12:00:00.000Z',
            interval: 15000,
        };
        await request
            .post('/api/client/metrics/bulk')
            .send({
                applications: [frontendApp, backendApp, defaultApp],
                metrics: [],
            })
            .expect(202);

        await services.clientInstanceService.bulkAdd();
        const app =
            await services.clientInstanceService.getApplication(
                'application-name',
            );

        expect(app).toMatchObject({
            appName: 'application-name',
            instances: [
                {
                    instanceId: 'browser',
                    sdkVersion: 'unleash-client-js:1.0.0',
                    environment: 'development',
                },
                {
                    instanceId: 'instance1234',
                    sdkVersion: 'unleash-client-node',
                    environment: 'development',
                },
                {
                    instanceId: 'instance5678',
                    sdkVersion: 'unleash-client-java',
                    environment: 'development',
                },
            ],
        });
    });

    test('should respect project from token', async () => {
        const frontendApp: BulkRegistrationSchema = {
            appName: 'application-name-token',
            instanceId: 'browser',
            environment: 'production',
            sdkVersion: 'unleash-client-js:1.0.0',
            sdkType: 'frontend',
            projects: ['project-a', 'project-b'],
        };
        const backendApp: BulkRegistrationSchema = {
            appName: 'application-name-token',
            instanceId: 'instance1234',
            environment: 'development',
            sdkVersion: 'unleash-client-node',
            sdkType: 'backend',
            started: '1952-03-11T12:00:00.000Z',
            interval: 15000,
            projects: ['project-b', 'project-c'],
        };
        const defaultApp: BulkRegistrationSchema = {
            appName: 'application-name-token',
            instanceId: 'instance5678',
            environment: 'development',
            sdkVersion: 'unleash-client-java',
            sdkType: null,
            started: '1952-03-11T12:00:00.000Z',
            interval: 15000,
            projects: ['project-c', 'project-d'],
        };
        await request
            .post('/api/client/metrics/bulk')
            .send({
                applications: [frontendApp, backendApp, defaultApp],
                metrics: [],
            })
            .expect(202);

        await services.clientInstanceService.bulkAdd();
        const app = await services.clientInstanceService.getApplication(
            'application-name-token',
        );

        expect(app).toMatchObject({
            appName: 'application-name-token',
            instances: [
                {
                    instanceId: 'instance1234',
                    sdkVersion: 'unleash-client-node',
                    environment: 'development',
                },
                {
                    instanceId: 'instance5678',
                    sdkVersion: 'unleash-client-java',
                    environment: 'development',
                },
                {
                    instanceId: 'browser',
                    sdkVersion: 'unleash-client-js:1.0.0',
                    environment: 'production',
                },
            ],
        });

        const applications =
            await stores.clientApplicationsStore.getApplications({
                limit: 10,
                offset: 0,
                sortBy: 'name',
                sortOrder: 'asc',
            });
        expect(applications).toMatchObject({
            applications: [
                {
                    usage: [
                        {
                            project: 'project-a',
                            environments: ['production'],
                        },
                        {
                            project: 'project-b',
                            environments: ['production', 'development'],
                        },
                        {
                            project: 'project-c',
                            environments: ['development'],
                        },
                        { project: 'project-d', environments: ['development'] },
                    ],
                },
            ],
        });
    });

    test('without access to production environment due to no auth setup, we can only access the default env', async () => {
        const now = new Date();

        // @ts-expect-error - cachedFeatureNames is a private property in ClientMetricsServiceV2
        services.clientMetricsServiceV2.cachedFeatureNames = vi
            .fn<() => Promise<string[]>>()
            .mockResolvedValue(['test_feature_one', 'test_feature_two']);

        await request
            .post('/api/client/metrics/bulk')
            .send({
                applications: [],
                metrics: [
                    {
                        featureName: 'test_feature_one',
                        appName: 'test_application',
                        environment: DEFAULT_ENV,
                        timestamp: startOfHour(now),
                        yes: 1000,
                        no: 800,
                        variants: {},
                    },
                    {
                        featureName: 'test_feature_two',
                        appName: 'test_application',
                        environment: 'production',
                        timestamp: startOfHour(now),
                        yes: 1000,
                        no: 800,
                        variants: {},
                    },
                ],
            })
            .expect(202);

        await services.clientMetricsServiceV2.bulkAdd(); // Force bulk collection.

        const developmentReport =
            await services.clientMetricsServiceV2.getClientMetricsForToggle(
                'test_feature_two',
                1,
            );
        const defaultReport =
            await services.clientMetricsServiceV2.getClientMetricsForToggle(
                'test_feature_one',
                1,
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

    test('bulk metrics requires a valid client token to accept metrics', async () => {
        const authed = await getSetup({
            authentication: {
                type: IAuthType.DEMO,
                enableApiToken: true,
            },
        });
        const clientToken =
            await authed.services.apiTokenService.createApiTokenWithProjects({
                tokenName: 'bulk-metrics-test',
                type: ApiTokenType.CLIENT,
                environment: 'development',
                projects: ['*'],
            });
        const backendToken =
            await authed.services.apiTokenService.createApiTokenWithProjects({
                tokenName: 'backend-bulk-metrics-test',
                type: ApiTokenType.BACKEND,
                environment: 'development',
                projects: ['*'],
            });
        const frontendToken =
            await authed.services.apiTokenService.createApiTokenWithProjects({
                tokenName: 'frontend-bulk-metrics-test',
                type: ApiTokenType.FRONTEND,
                environment: 'development',
                projects: ['*'],
            });

        await authed.request
            .post('/api/client/metrics/bulk')
            .send({ applications: [], metrics: [] })
            .expect(401);
        await authed.request
            .post('/api/client/metrics/bulk')
            .set('Authorization', frontendToken.secret)
            .send({ applications: [], metrics: [] })
            .expect(403);
        await authed.request
            .post('/api/client/metrics/bulk')
            .set('Authorization', backendToken.secret)
            .send({ applications: [], metrics: [] })
            .expect(202);
        await authed.request
            .post('/api/client/metrics/bulk')
            .set('Authorization', clientToken.secret)
            .send({ applications: [], metrics: [] })
            .expect(202);
        await authed.destroy();
    });
});
