import supertest, { type Test } from 'supertest';
import getApp from '../../../app.js';
import { createTestConfig } from '../../../../test/config/test-config.js';
import {
    type IUnleashServices,
    createServices,
} from '../../../services/index.js';
import type {
    IUnleashConfig,
    IUnleashOptions,
    IUnleashStores,
} from '../../../types/index.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import { startOfHour } from 'date-fns';
import type TestAgent from 'supertest/lib/agent.d.ts';
import type { BulkRegistrationSchema } from '../../../openapi/index.js';
import type { EventEmitter } from 'stream';
import { CLIENT_METRICS } from '../../../events/index.js';

let db: ITestDb;
let config: IUnleashConfig;
let eventBus: EventEmitter;

async function getSetup(opts?: IUnleashOptions) {
    config = createTestConfig(opts);
    db = await dbInit('unknown_flags', config.getLogger);

    const services = createServices(db.stores, config, db.rawDatabase);
    const app = await getApp(config, db.stores, services);

    config.eventBus.emit = vi.fn();

    return {
        request: supertest(app),
        stores: db.stores,
        services,
        db: db.rawDatabase,
        destroy: db.destroy,
        eventBus: config.eventBus,
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
    eventBus = setup.eventBus;
});

afterAll(async () => {
    await destroy();
});

afterEach(async () => {
    await stores.unknownFlagsStore.deleteAll();
});

describe('should register unknown flags', () => {
    test('/metrics endpoint', async () => {
        // @ts-expect-error - cachedFeatureNames is a private property in ClientMetricsServiceV2
        services.clientMetricsServiceV2.cachedFeatureNames = vi
            .fn<() => Promise<string[]>>()
            .mockResolvedValue(['existing_flag']);

        await request
            .post('/api/client/metrics')
            .send({
                appName: 'demo',
                instanceId: '1',
                bucket: {
                    start: Date.now(),
                    stop: Date.now(),
                    toggles: {
                        existing_flag: {
                            yes: 200,
                            no: 0,
                        },
                        unknown_flag: {
                            yes: 100,
                            no: 50,
                        },
                    },
                },
            })
            .expect(202);

        await services.unknownFlagsService.flush();
        const unknownFlags = await services.unknownFlagsService.getAll();

        expect(unknownFlags).toHaveLength(1);
        expect(unknownFlags[0]).toMatchObject({
            name: 'unknown_flag',
            lastSeenAt: expect.any(Date),
            reports: [
                {
                    appName: 'demo',
                    environments: [
                        {
                            environment: 'development',
                            seenAt: expect.any(Date),
                        },
                    ],
                },
            ],
        });
        expect(eventBus.emit).toHaveBeenCalledWith(
            CLIENT_METRICS,
            expect.arrayContaining([
                expect.objectContaining({
                    featureName: 'existing_flag',
                    yes: 200,
                }),
            ]),
        );
    });

    test('/metrics/bulk endpoint', async () => {
        // @ts-expect-error - cachedFeatureNames is a private property in ClientMetricsServiceV2
        services.clientMetricsServiceV2.cachedFeatureNames = vi
            .fn<() => Promise<string[]>>()
            .mockResolvedValue(['existing_flag_bulk']);

        const unknownFlag: BulkRegistrationSchema = {
            appName: 'demo',
            instanceId: '1',
            environment: 'development',
            sdkVersion: 'unleash-client-js:1.0.0',
            sdkType: 'frontend',
        };

        await request
            .post('/api/client/metrics/bulk')
            .send({
                applications: [unknownFlag],
                metrics: [
                    {
                        featureName: 'existing_flag_bulk',
                        environment: 'development',
                        appName: 'demo',
                        timestamp: startOfHour(new Date()),
                        yes: 1337,
                        no: 0,
                        variants: {},
                    },
                    {
                        featureName: 'unknown_flag_bulk',
                        environment: 'development',
                        appName: 'demo',
                        timestamp: startOfHour(new Date()),
                        yes: 200,
                        no: 100,
                        variants: {},
                    },
                ],
            })
            .expect(202);

        await services.unknownFlagsService.flush();
        const unknownFlags = await services.unknownFlagsService.getAll();

        expect(unknownFlags).toHaveLength(1);
        expect(unknownFlags[0]).toMatchObject({
            name: 'unknown_flag_bulk',
            lastSeenAt: expect.any(Date),
            reports: [
                {
                    appName: 'demo',
                    environments: [
                        {
                            environment: 'development',
                            seenAt: expect.any(Date),
                        },
                    ],
                },
            ],
        });
        expect(eventBus.emit).toHaveBeenCalledWith(
            CLIENT_METRICS,
            expect.arrayContaining([
                expect.objectContaining({
                    featureName: 'existing_flag_bulk',
                    yes: 1337,
                }),
            ]),
        );
    });
});

describe('should fetch unknown flags', () => {
    test('returns empty list by default', async () => {
        const res = await request
            .get('/api/admin/metrics/unknown-flags')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body).toMatchObject({
            unknownFlags: [],
        });
    });

    test('returns list of unknown flags', async () => {
        const unknownFlag: BulkRegistrationSchema = {
            appName: 'demo',
            instanceId: '1',
            environment: 'development',
            sdkVersion: 'unleash-client-js:1.0.0',
            sdkType: 'frontend',
        };

        await request
            .post('/api/client/metrics/bulk')
            .send({
                applications: [unknownFlag],
                metrics: [
                    {
                        featureName: 'unknown_flag_1',
                        environment: 'development',
                        appName: 'demo',
                        timestamp: startOfHour(new Date()),
                        yes: 1337,
                        no: 0,
                        variants: {},
                    },
                    {
                        featureName: 'unknown_flag_2',
                        environment: 'development',
                        appName: 'demo',
                        timestamp: startOfHour(new Date()),
                        yes: 200,
                        no: 100,
                        variants: {},
                    },
                ],
            })
            .expect(202);

        await services.unknownFlagsService.flush();

        const res = await request
            .get('/api/admin/metrics/unknown-flags')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body.unknownFlags).toHaveLength(2);
        expect(res.body.unknownFlags).toEqual([
            expect.objectContaining({
                name: 'unknown_flag_1',
                lastSeenAt: expect.any(String),
                lastEventAt: null,
                reports: [
                    {
                        appName: 'demo',
                        environments: [
                            {
                                environment: 'development',
                                seenAt: expect.any(String),
                            },
                        ],
                    },
                ],
            }),
            expect.objectContaining({
                name: 'unknown_flag_2',
                lastSeenAt: expect.any(String),
                lastEventAt: null,
                reports: [
                    {
                        appName: 'demo',
                        environments: [
                            {
                                environment: 'development',
                                seenAt: expect.any(String),
                            },
                        ],
                    },
                ],
            }),
        ]);
    });

    test('does not include flags that have since been created in Unleash', async () => {
        const unknownFlag: BulkRegistrationSchema = {
            appName: 'demo',
            instanceId: '1',
            environment: 'development',
            sdkVersion: 'unleash-client-js:1.0.0',
            sdkType: 'frontend',
        };

        await request
            .post('/api/client/metrics/bulk')
            .send({
                applications: [unknownFlag],
                metrics: [
                    {
                        featureName: 'flag_that_will_be_created',
                        environment: 'development',
                        appName: 'demo',
                        timestamp: startOfHour(new Date()),
                        yes: 1337,
                        no: 0,
                        variants: {},
                    },
                    {
                        featureName: 'unknown_flag_2',
                        environment: 'development',
                        appName: 'demo',
                        timestamp: startOfHour(new Date()),
                        yes: 200,
                        no: 100,
                        variants: {},
                    },
                ],
            })
            .expect(202);

        await services.unknownFlagsService.flush();

        await request
            .post('/api/admin/projects/default/features')
            .send({
                name: 'flag_that_will_be_created',
                description: '',
                type: 'release',
                impressionData: false,
            })
            .expect(201);

        const res = await request
            .get('/api/admin/metrics/unknown-flags')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body.unknownFlags).toHaveLength(1);
        expect(res.body.unknownFlags).toEqual([
            expect.objectContaining({
                name: 'unknown_flag_2',
                lastSeenAt: expect.any(String),
                reports: [
                    {
                        appName: 'demo',
                        environments: [
                            {
                                environment: 'development',
                                seenAt: expect.any(String),
                            },
                        ],
                    },
                ],
            }),
        ]);
    });
});
