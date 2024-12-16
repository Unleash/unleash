import { RoleName } from '../../../types/model';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';
import { DEFAULT_ENV } from '../../../util/constants';
import { type IUserWithRootRole, TEST_AUDIT_USER } from '../../../types';

let app: IUnleashTest;
let db: ITestDb;
let dummyAdmin: IUserWithRootRole;

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
                constraints: [],
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
};

const setupFeatures = async (
    db: ITestDb,
    app: IUnleashTest,
    project = 'default',
) => {
    await db.rawDatabase.raw('DELETE FROM features');

    await app.createFeature('test1', project);
    await app.createFeature('test2', project);

    await app.addStrategyToFeatureEnv(
        {
            name: 'flexibleRollout',
            constraints: [],
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
    db = await dbInit('client_feature_toggles_delta', getLogger);
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

    dummyAdmin = await app.services.userService.createUser(
        {
            name: 'Some Name',
            email: 'test@getunleash.io',
            rootRole: RoleName.ADMIN,
        },
        TEST_AUDIT_USER,
    );
});

afterEach(async () => {
    await cleanup(db, app);
    await db.rawDatabase.raw('DELETE FROM events');
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should match with /api/client/delta', async () => {
    await setupFeatures(db, app);

    const { body } = await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);

    const { body: deltaBody } = await app.request
        .get('/api/client/delta')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.features).toMatchObject(deltaBody.updated);
});

test('should get 304 if asked for latest revision', async () => {
    await setupFeatures(db, app);
    // @ts-ignore
    console.log(app.services.clientFeatureToggleService.clientFeatureToggleDelta);
    
    // @ts-ignore
    app.services.clientFeatureToggleService.clientFeatureToggleDelta.currentRevisionId = 14;

    const events = await db.rawDatabase('events').select('*');
    console.log(events);

    await app.request
        .set('If-None-Match', '14')
        .get('/api/client/delta')
        .expect(304);
});
