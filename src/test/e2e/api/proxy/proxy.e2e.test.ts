import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { randomId } from '../../../../lib/util/random-id';
import {
    ApiTokenType,
    IApiToken,
    IApiTokenCreate,
} from '../../../../lib/types/models/api-token';
import { startOfHour } from 'date-fns';
import { IConstraint, IStrategyConfig } from '../../../../lib/types/model';
import { ProxyRepository } from '../../../../lib/proxy/proxy-repository';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('proxy', getLogger);
    app = await setupAppWithAuth(db.stores, {
        frontendApiOrigins: ['https://example.com'],
    });
});

afterEach(() => {
    app.services.proxyService.stopAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await db.stores.segmentStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.clientMetricsStoreV2.deleteAll();
    await db.stores.apiTokenStore.deleteAll();
});

export const createApiToken = (
    type: ApiTokenType,
    overrides: Partial<Omit<IApiTokenCreate, 'type' | 'secret'>> = {},
): Promise<IApiToken> => {
    return app.services.apiTokenService.createApiTokenWithProjects({
        type,
        projects: ['*'],
        environment: 'default',
        username: `${type}-token-${randomId()}`,
        ...overrides,
    });
};

const createFeatureToggle = async ({
    name,
    project = 'default',
    environment = 'default',
    strategies,
    enabled,
}: {
    name: string;
    project?: string;
    environment?: string;
    strategies: IStrategyConfig[];
    enabled: boolean;
}) => {
    const createdFeature =
        await app.services.featureToggleService.createFeatureToggle(
            project,
            { name },
            'userName',
            true,
        );
    const createdStrategies = await Promise.all(
        (strategies ?? []).map(async (s) =>
            app.services.featureToggleService.createStrategy(
                s,
                { projectId: project, featureName: name, environment },
                'userName',
            ),
        ),
    );
    await app.services.featureToggleService.updateEnabled(
        project,
        name,
        environment,
        enabled,
        'userName',
    );
    return [createdFeature, createdStrategies] as const;
};

const createProject = async (id: string, name: string): Promise<void> => {
    const user = await db.stores.userStore.insert({
        name: randomId(),
        email: `${randomId()}@example.com`,
    });
    await app.services.projectService.createProject({ id, name }, user);
};

test('should require a frontend token or an admin token', async () => {
    await app.request
        .get('/api/frontend')
        .expect('Content-Type', /json/)
        .expect(401);
});

test('should not allow requests with a client token', async () => {
    const clientToken = await createApiToken(ApiTokenType.CLIENT);
    await app.request
        .get('/api/frontend')
        .set('Authorization', clientToken.secret)
        .expect('Content-Type', /json/)
        .expect(403);
});

test('should allow requests with a token secret alias', async () => {
    const featureA = randomId();
    const featureB = randomId();
    const envA = randomId();
    const envB = randomId();
    await db.stores.environmentStore.create({ name: envA, type: 'test' });
    await db.stores.environmentStore.create({ name: envB, type: 'test' });
    await db.stores.projectStore.addEnvironmentToProject('default', envA);
    await db.stores.projectStore.addEnvironmentToProject('default', envB);
    await createFeatureToggle({
        name: featureA,
        enabled: true,
        environment: envA,
        strategies: [{ name: 'default', constraints: [], parameters: {} }],
    });
    await createFeatureToggle({
        name: featureB,
        enabled: true,
        environment: envB,
        strategies: [{ name: 'default', constraints: [], parameters: {} }],
    });
    const tokenA = await createApiToken(ApiTokenType.FRONTEND, {
        alias: randomId(),
        environment: envA,
    });
    const tokenB = await createApiToken(ApiTokenType.FRONTEND, {
        alias: randomId(),
        environment: envB,
    });
    await app.request
        .get('/api/frontend')
        .expect('Content-Type', /json/)
        .expect(401);
    await app.request
        .get('/api/frontend')
        .set('Authorization', '')
        .expect('Content-Type', /json/)
        .expect(401);
    await app.request
        .get('/api/frontend')
        .set('Authorization', 'null')
        .expect('Content-Type', /json/)
        .expect(401);
    await app.request
        .get('/api/frontend')
        .set('Authorization', randomId())
        .expect('Content-Type', /json/)
        .expect(401);
    await app.request
        .get('/api/frontend')
        .set('Authorization', tokenA.secret.slice(0, -1))
        .expect('Content-Type', /json/)
        .expect(401);
    await app.request
        .get('/api/frontend')
        .set('Authorization', tokenA.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.toggles).toHaveLength(1))
        .expect((res) => expect(res.body.toggles[0].name).toEqual(featureA));
    await app.request
        .get('/api/frontend')
        .set('Authorization', tokenB.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.toggles).toHaveLength(1))
        .expect((res) => expect(res.body.toggles[0].name).toEqual(featureB));
    await app.request
        .get('/api/frontend')
        .set('Authorization', tokenA.alias)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.toggles).toHaveLength(1))
        .expect((res) => expect(res.body.toggles[0].name).toEqual(featureA));
    await app.request
        .get('/api/frontend')
        .set('Authorization', tokenB.alias)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.toggles).toHaveLength(1))
        .expect((res) => expect(res.body.toggles[0].name).toEqual(featureB));
});

test('should allow requests with an admin token', async () => {
    const featureA = randomId();
    await createFeatureToggle({
        name: featureA,
        enabled: true,
        strategies: [{ name: 'default', constraints: [], parameters: {} }],
    });
    const adminToken = await createApiToken(ApiTokenType.ADMIN, {
        projects: ['*'],
        environment: '*',
    });
    await app.request
        .get('/api/frontend')
        .set('Authorization', adminToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.toggles).toHaveLength(1))
        .expect((res) => expect(res.body.toggles[0].name).toEqual(featureA));
});

test('should not allow admin requests with a frontend token', async () => {
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await app.request
        .get('/api/admin/features')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(403);
});

test('should not allow client requests with a frontend token', async () => {
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await app.request
        .get('/api/client/features')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(403);
});

test('should not allow requests with an invalid frontend token', async () => {
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendToken.secret.slice(0, -1))
        .expect('Content-Type', /json/)
        .expect(401);
});

test('should allow requests with a frontend token', async () => {
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body).toEqual({ toggles: [] }));
});

test('should return 405 from unimplemented endpoints', async () => {
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await app.request
        .post('/api/frontend')
        .send({})
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(405);
    await app.request
        .get('/api/frontend/client/features')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(405);
    await app.request
        .get('/api/frontend/health')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(405);
    await app.request
        .get('/api/frontend/internal-backstage/prometheus')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(405);
});

test('should enforce frontend API CORS config', async () => {
    const allowedOrigin = 'https://example.com';
    const unknownOrigin = 'https://example.org';
    const origin = 'access-control-allow-origin';
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await app.request
        .options('/api/frontend')
        .set('Origin', unknownOrigin)
        .set('Authorization', frontendToken.secret)
        .expect((res) => expect(res.headers[origin]).toBeUndefined());
    await app.request
        .options('/api/frontend')
        .set('Origin', allowedOrigin)
        .set('Authorization', frontendToken.secret)
        .expect((res) => expect(res.headers[origin]).toEqual(allowedOrigin));
    await app.request
        .get('/api/frontend')
        .set('Origin', unknownOrigin)
        .set('Authorization', frontendToken.secret)
        .expect((res) => expect(res.headers[origin]).toBeUndefined());
    await app.request
        .get('/api/frontend')
        .set('Origin', allowedOrigin)
        .set('Authorization', frontendToken.secret)
        .expect((res) => expect(res.headers[origin]).toEqual(allowedOrigin));
});

test('should accept client registration requests', async () => {
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await app.request
        .post('/api/frontend/client/register')
        .set('Authorization', frontendToken.secret)
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);
    await app.request
        .post('/api/frontend/client/register')
        .set('Authorization', frontendToken.secret)
        .send({
            appName: randomId(),
            instanceId: randomId(),
            sdkVersion: randomId(),
            environment: 'default',
            interval: 10000,
            started: new Date(),
            strategies: ['default'],
        })
        .expect(200)
        .expect((res) => expect(res.text).toEqual('OK'));
});

test('should store proxy client metrics', async () => {
    const now = new Date();
    const appName = randomId();
    const instanceId = randomId();
    const featureName = randomId();
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    const adminToken = await createApiToken(ApiTokenType.ADMIN, {
        projects: ['*'],
        environment: '*',
    });
    await app.request
        .get(`/api/admin/client-metrics/features/${featureName}`)
        .set('Authorization', adminToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
            expect(res.body).toEqual({
                featureName,
                lastHourUsage: [],
                maturity: 'stable',
                seenApplications: [],
                version: 1,
            });
        });
    await app.request
        .post('/api/frontend/client/metrics')
        .set('Authorization', frontendToken.secret)
        .send({
            appName,
            instanceId,
            bucket: {
                start: now,
                stop: now,
                toggles: { [featureName]: { yes: 1, no: 10 } },
            },
        })
        .expect(200)
        .expect((res) => expect(res.text).toEqual('OK'));
    await app.request
        .post('/api/frontend/client/metrics')
        .set('Authorization', frontendToken.secret)
        .send({
            appName,
            instanceId,
            bucket: {
                start: now,
                stop: now,
                toggles: { [featureName]: { yes: 2, no: 20 } },
            },
        })
        .expect(200)
        .expect((res) => expect(res.text).toEqual('OK'));
    await app.services.clientMetricsServiceV2.bulkAdd();
    await app.request
        .get(`/api/admin/client-metrics/features/${featureName}`)
        .set('Authorization', adminToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
            expect(res.body).toEqual({
                featureName,
                lastHourUsage: [
                    {
                        environment: 'default',
                        timestamp: startOfHour(now).toISOString(),
                        yes: 3,
                        no: 30,
                    },
                ],
                maturity: 'stable',
                seenApplications: [appName],
                version: 1,
            });
        });
});

test('should filter features by enabled/disabled', async () => {
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await createFeatureToggle({
        name: 'enabledFeature1',
        enabled: true,
        strategies: [{ name: 'default', constraints: [], parameters: {} }],
    });
    await createFeatureToggle({
        name: 'enabledFeature2',
        enabled: true,
        strategies: [{ name: 'default', constraints: [], parameters: {} }],
    });
    await createFeatureToggle({
        name: 'disabledFeature',
        enabled: false,
        strategies: [{ name: 'default', constraints: [], parameters: {} }],
    });
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toEqual({
                toggles: [
                    {
                        name: 'enabledFeature1',
                        enabled: true,
                        impressionData: false,
                        variant: { enabled: false, name: 'disabled' },
                    },
                    {
                        name: 'enabledFeature2',
                        enabled: true,
                        impressionData: false,
                        variant: { enabled: false, name: 'disabled' },
                    },
                ],
            });
        });
});

test('should filter features by strategies', async () => {
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await createFeatureToggle({
        name: 'featureWithoutStrategies',
        enabled: false,
        strategies: [],
    });
    await createFeatureToggle({
        name: 'featureWithUnknownStrategy',
        enabled: true,
        strategies: [{ name: 'unknown', constraints: [], parameters: {} }],
    });
    await createFeatureToggle({
        name: 'featureWithMultipleStrategies',
        enabled: true,
        strategies: [
            { name: 'default', constraints: [], parameters: {} },
            { name: 'unknown', constraints: [], parameters: {} },
        ],
    });
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toEqual({
                toggles: [
                    {
                        name: 'featureWithMultipleStrategies',
                        enabled: true,
                        impressionData: false,
                        variant: { enabled: false, name: 'disabled' },
                    },
                ],
            });
        });
});

test('should filter features by constraints', async () => {
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await createFeatureToggle({
        name: 'featureWithAppNameA',
        enabled: true,
        strategies: [
            {
                name: 'default',
                constraints: [
                    { contextName: 'appName', operator: 'IN', values: ['a'] },
                ],
                parameters: {},
            },
        ],
    });
    await createFeatureToggle({
        name: 'featureWithAppNameAorB',
        enabled: true,
        strategies: [
            {
                name: 'default',
                constraints: [
                    {
                        contextName: 'appName',
                        operator: 'IN',
                        values: ['a', 'b'],
                    },
                ],
                parameters: {},
            },
        ],
    });
    await app.request
        .get('/api/frontend?appName=a')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.toggles).toHaveLength(2));
    await app.request
        .get('/api/frontend?appName=b')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.toggles).toHaveLength(1));
    await app.request
        .get('/api/frontend?appName=c')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.toggles).toHaveLength(0));
});

test('should filter features by project', async () => {
    const projectA = 'projectA';
    const projectB = 'projectB';
    await createProject(projectA, randomId());
    await createProject(projectB, randomId());
    const frontendTokenDefault = await createApiToken(ApiTokenType.FRONTEND, {
        projects: ['default'],
    });
    const frontendTokenProjectA = await createApiToken(ApiTokenType.FRONTEND, {
        projects: [projectA],
    });
    const frontendTokenProjectAB = await createApiToken(ApiTokenType.FRONTEND, {
        projects: [projectA, projectB],
    });
    await createFeatureToggle({
        name: 'featureInProjectDefault',
        enabled: true,
        strategies: [{ name: 'default', parameters: {} }],
    });
    await createFeatureToggle({
        name: 'featureInProjectA',
        project: projectA,
        enabled: true,
        strategies: [{ name: 'default', parameters: {} }],
    });
    await createFeatureToggle({
        name: 'featureInProjectB',
        project: projectB,
        enabled: true,
        strategies: [{ name: 'default', parameters: {} }],
    });
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendTokenDefault.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toEqual({
                toggles: [
                    {
                        name: 'featureInProjectDefault',
                        enabled: true,
                        impressionData: false,
                        variant: { enabled: false, name: 'disabled' },
                    },
                ],
            });
        });
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendTokenProjectA.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toEqual({
                toggles: [
                    {
                        name: 'featureInProjectA',
                        enabled: true,
                        impressionData: false,
                        variant: { enabled: false, name: 'disabled' },
                    },
                ],
            });
        });
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendTokenProjectAB.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toEqual({
                toggles: [
                    {
                        name: 'featureInProjectA',
                        enabled: true,
                        impressionData: false,
                        variant: { enabled: false, name: 'disabled' },
                    },
                    {
                        name: 'featureInProjectB',
                        enabled: true,
                        impressionData: false,
                        variant: { enabled: false, name: 'disabled' },
                    },
                ],
            });
        });
});

test('should filter features by environment', async () => {
    const environmentA = 'environmentA';
    const environmentB = 'environmentB';
    await db.stores.environmentStore.create({
        name: environmentA,
        type: 'production',
    });
    await db.stores.environmentStore.create({
        name: environmentB,
        type: 'production',
    });
    await app.services.environmentService.addEnvironmentToProject(
        environmentA,
        'default',
    );
    await app.services.environmentService.addEnvironmentToProject(
        environmentB,
        'default',
    );
    const frontendTokenEnvironmentDefault = await createApiToken(
        ApiTokenType.FRONTEND,
    );
    const frontendTokenEnvironmentA = await createApiToken(
        ApiTokenType.FRONTEND,
        {
            environment: environmentA,
        },
    );
    const frontendTokenEnvironmentB = await createApiToken(
        ApiTokenType.FRONTEND,
        {
            environment: environmentB,
        },
    );
    await createFeatureToggle({
        name: 'featureInEnvironmentDefault',
        enabled: true,
        strategies: [{ name: 'default', parameters: {} }],
    });
    await createFeatureToggle({
        name: 'featureInEnvironmentA',
        environment: environmentA,
        enabled: true,
        strategies: [{ name: 'default', parameters: {} }],
    });
    await createFeatureToggle({
        name: 'featureInEnvironmentB',
        environment: environmentB,
        enabled: true,
        strategies: [{ name: 'default', parameters: {} }],
    });
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendTokenEnvironmentDefault.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toEqual({
                toggles: [
                    {
                        name: 'featureInEnvironmentDefault',
                        enabled: true,
                        impressionData: false,
                        variant: { enabled: false, name: 'disabled' },
                    },
                ],
            });
        });
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendTokenEnvironmentA.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toEqual({
                toggles: [
                    {
                        name: 'featureInEnvironmentA',
                        enabled: true,
                        impressionData: false,
                        variant: { enabled: false, name: 'disabled' },
                    },
                ],
            });
        });
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendTokenEnvironmentB.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toEqual({
                toggles: [
                    {
                        name: 'featureInEnvironmentB',
                        enabled: true,
                        impressionData: false,
                        variant: { enabled: false, name: 'disabled' },
                    },
                ],
            });
        });
});

test('should filter features by segment', async () => {
    const [featureA, [strategyA]] = await createFeatureToggle({
        name: randomId(),
        enabled: true,
        strategies: [{ name: 'default', parameters: {} }],
    });
    const [featureB, [strategyB]] = await createFeatureToggle({
        name: randomId(),
        enabled: true,
        strategies: [{ name: 'default', parameters: {} }],
    });
    const constraintA: IConstraint = {
        operator: 'IN',
        contextName: 'appName',
        values: ['a'],
    };
    const constraintB: IConstraint = {
        operator: 'IN',
        contextName: 'appName',
        values: ['b'],
    };
    const segmentA = await app.services.segmentService.create(
        { name: randomId(), constraints: [constraintA] },
        { email: 'test@example.com' },
    );
    const segmentB = await app.services.segmentService.create(
        { name: randomId(), constraints: [constraintB] },
        { email: 'test@example.com' },
    );
    await app.services.segmentService.addToStrategy(segmentA.id, strategyA.id);
    await app.services.segmentService.addToStrategy(segmentB.id, strategyB.id);
    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body).toEqual({ toggles: [] }));
    await app.request
        .get('/api/frontend?appName=a')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.toggles).toHaveLength(1))
        .expect((res) =>
            expect(res.body.toggles[0].name).toEqual(featureA.name),
        );
    await app.request
        .get('/api/frontend?appName=b')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.toggles).toHaveLength(1))
        .expect((res) =>
            expect(res.body.toggles[0].name).toEqual(featureB.name),
        );
    await app.request
        .get('/api/frontend?appName=c')
        .set('Authorization', frontendToken.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body).toEqual({ toggles: [] }));
});

test('Should sync proxy for keys on an interval', async () => {
    jest.useFakeTimers();

    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    const user = await app.services.apiTokenService.getUserForToken(
        frontendToken.secret,
    );

    const spy = jest.spyOn(
        ProxyRepository.prototype as any,
        'featuresForToken',
    );
    const proxyRepository = new ProxyRepository(
        {
            getLogger,
            frontendApi: { refreshIntervalInMs: 5000 },
        },
        db.stores,
        app.services,
        user,
    );

    await proxyRepository.start();

    jest.advanceTimersByTime(60000);

    proxyRepository.stop();
    expect(spy.mock.calls.length > 6).toBe(true);
    jest.useRealTimers();
});

test('Should change fetch interval', async () => {
    jest.useFakeTimers();

    const frontendToken = await createApiToken(ApiTokenType.FRONTEND);
    const user = await app.services.apiTokenService.getUserForToken(
        frontendToken.secret,
    );

    const spy = jest.spyOn(
        ProxyRepository.prototype as any,
        'featuresForToken',
    );
    const proxyRepository = new ProxyRepository(
        {
            getLogger,
            frontendApi: { refreshIntervalInMs: 1000 },
        },
        db.stores,
        app.services,
        user,
    );

    await proxyRepository.start();

    jest.advanceTimersByTime(60000);

    proxyRepository.stop();
    expect(spy.mock.calls.length > 30).toBe(true);
    jest.useRealTimers();
});
