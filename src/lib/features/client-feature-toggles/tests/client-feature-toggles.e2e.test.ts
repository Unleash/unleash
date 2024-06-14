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

const apiClientResponse = [
    {
        name: 'test1',
        type: 'release',
        enabled: false,
        project: 'default',
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
        project: 'default',
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

beforeAll(async () => {
    db = await dbInit('client_feature_toggles', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
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
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
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
    await db.rawDatabase.raw('DELETE FROM features');

    await app.createFeature('test1', 'default');
    await app.createFeature('test2', 'default');

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
    );

    const result = await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(result.body.features).toEqual(apiClientResponse);
});
