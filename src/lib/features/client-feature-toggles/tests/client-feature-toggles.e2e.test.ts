import { RoleName } from '../../../types/model.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import { DEFAULT_ENV } from '../../../util/constants.js';
import {
    type IUserWithRootRole,
    TEST_AUDIT_USER,
} from '../../../types/index.js';

let app: IUnleashTest;
let db: ITestDb;
let dummyAdmin: IUserWithRootRole;
let proApp: IUnleashTest;
let proDb: ITestDb;
let enterpriseApp: IUnleashTest;
let enterpriseDb: ITestDb;
let enterpriseDummyAdmin: IUserWithRootRole;
let proDummyAdmin: IUserWithRootRole;

const DB_SETUP_TIMEOUT = 60_000; // Concurrent e2e runs may need extra time to clone template DBs.

const getApiClientResponse = (project = 'default') => [
    {
        name: 'test1',
        type: 'release',
        enabled: false,
        project: project,
        stale: false,
        strategies: [
            {
                name: 'flexibleRollout',
                constraints: [
                    {
                        contextName: 'appName',
                        operator: 'IN',
                        values: ['test'],
                        caseInsensitive: false,
                        inverted: false,
                    },
                ],
                parameters: {
                    rollout: '100',
                    stickiness: 'default',
                    groupId: 'test1',
                },
                variants: [],
            },
        ],
        variants: [],
        description: null,
        impressionData: false,
    },
    {
        name: 'test2',
        type: 'release',
        enabled: false,
        project: project,
        stale: false,
        strategies: [
            {
                name: 'default',
                constraints: [
                    {
                        contextName: 'userId',
                        operator: 'IN',
                        values: ['123'],
                    },
                ],
                parameters: {},
                variants: [],
            },
        ],
        variants: [],
        description: null,
        impressionData: false,
    },
];

const cleanup = async (db: ITestDb, app: IUnleashTest) => {
    const all =
        await db.stores.projectStore.getEnvironmentsForProject('default');
    await Promise.all(
        all
            .filter((env) => env.environment !== DEFAULT_ENV)
            .map(async (env) =>
                db.stores.projectStore.deleteEnvironmentForProject(
                    'default',
                    env.environment,
                ),
            ),
    );
    await db.stores.segmentStore.deleteAll();
};

const setupFeatures = async (
    db: ITestDb,
    app: IUnleashTest,
    project = 'default',
) => {
    await db.rawDatabase.raw('DELETE FROM features');

    await app.createFeature('test1', project);
    await app.createFeature('test2', project);

    const { body: segmentBody } = await app.createSegment({
        name: 'a',
        constraints: [
            {
                contextName: 'appName',
                operator: 'IN',
                values: ['test'],
                caseInsensitive: false,
                inverted: false,
            },
        ],
    });

    await app.addStrategyToFeatureEnv(
        {
            name: 'flexibleRollout',
            constraints: [],
            segments: [segmentBody.id],
            parameters: {
                rollout: '100',
                stickiness: 'default',
                groupId: 'test1',
            },
        },
        DEFAULT_ENV,
        'test1',
        project,
    );
    await app.addStrategyToFeatureEnv(
        {
            name: 'default',
            constraints: [
                { contextName: 'userId', operator: 'IN', values: ['123'] },
            ],
            parameters: {},
        },
        DEFAULT_ENV,
        'test2',
        project,
    );
};

beforeAll(async () => {
    db = await dbInit('client_feature_toggles', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    deltaApi: true,
                },
            },
        },
        db.rawDatabase,
    );

    enterpriseDb = await dbInit('client_feature_toggles_enterprise', getLogger);
    enterpriseApp = await setupAppWithCustomConfig(
        enterpriseDb.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
            ui: {
                environment: 'Enterprise',
            },
        },
        enterpriseDb.rawDatabase,
    );

    proDb = await dbInit('client_feature_toggles_pro', getLogger);
    proApp = await setupAppWithCustomConfig(
        proDb.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
            ui: {
                environment: 'Pro',
            },
        },
        proDb.rawDatabase,
    );

    dummyAdmin = await app.services.userService.createUser(
        {
            name: 'Some Name',
            email: 'test@getunleash.io',
            rootRole: RoleName.ADMIN,
        },
        TEST_AUDIT_USER,
    );

    enterpriseDummyAdmin = await enterpriseApp.services.userService.createUser(
        {
            name: 'Some Name',
            email: 'test@getunleash.io',
            rootRole: RoleName.ADMIN,
        },
        TEST_AUDIT_USER,
    );

    proDummyAdmin = await proApp.services.userService.createUser(
        {
            name: 'Some Name',
            email: 'test@getunleash.io',
            rootRole: RoleName.ADMIN,
        },
        TEST_AUDIT_USER,
    );
}, DB_SETUP_TIMEOUT);

afterEach(async () => {
    await cleanup(db, app);
    await cleanup(proDb, proApp);
    await cleanup(enterpriseDb, enterpriseApp);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
    await proApp.destroy();
    await proDb.destroy();
    await enterpriseApp.destroy();
    await enterpriseDb.destroy();
});

test('should fetch single feature', async () => {
    expect.assertions(1);
    await app.createFeature('test_', 'default');

    return app.request
        .get(`/api/client/features/test_`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.name === 'test_').toBe(true);
        });
});

test('should support name prefix', async () => {
    expect.assertions(2);
    await app.createFeature('a_test1');
    await app.createFeature('a_test2');
    await app.createFeature('b_test1');
    await app.createFeature('b_test2');

    const namePrefix = 'b_';

    return app.request
        .get(`/api/client/features?namePrefix=${namePrefix}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features.length).toBe(2);
            expect(res.body.features[1].name).toBe('b_test2');
        });
});

test('should support filtering on project', async () => {
    expect.assertions(2);
    await app.services.projectService.createProject(
        { name: 'projectA', id: 'projecta' },
        dummyAdmin,
        TEST_AUDIT_USER,
    );
    await app.services.projectService.createProject(
        { name: 'projectB', id: 'projectb' },
        dummyAdmin,
        TEST_AUDIT_USER,
    );
    await app.createFeature('ab_test1', 'projecta');
    await app.createFeature('bd_test2', 'projectb');
    return app.request
        .get(`/api/client/features?project=projecta`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
            expect(res.body.features[0].name).toBe('ab_test1');
        });
});

test('should return correct data structure from /api/client/features', async () => {
    await setupFeatures(db, app);

    const result = await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(result.body.features).toEqual(getApiClientResponse());
});

test('should return correct data structure from /api/client/features for pro', async () => {
    await proApp.services.projectService.createProject(
        { name: 'Pro', id: 'pro' },
        proDummyAdmin,
        TEST_AUDIT_USER,
    );

    await setupFeatures(proDb, proApp, 'pro');

    const result = await proApp.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(result.body.features).toEqual(getApiClientResponse('pro'));
});

test('should return correct data structure from /api/client/features for Enterprise', async () => {
    await enterpriseApp.services.projectService.createProject(
        { name: 'Enterprise', id: 'enterprise' },
        enterpriseDummyAdmin,
        TEST_AUDIT_USER,
    );

    await setupFeatures(enterpriseDb, enterpriseApp, 'enterprise');

    const result = await enterpriseApp.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(result.body.features).toEqual(getApiClientResponse('enterprise'));
});

test('should match snapshot from /api/client/features', async () => {
    await setupFeatures(db, app);

    const result = await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(result.body).toMatchSnapshot();
});
