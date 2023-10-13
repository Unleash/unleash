import { RoleName } from '../../../types/model';
import dbInit, { ITestDb } from '../../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';
import { DEFAULT_ENV } from '../../../util/constants';

let app: IUnleashTest;
let db: ITestDb;
let dummyAdmin;

beforeAll(async () => {
    db = await dbInit('client_feature_toggles', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    dependentFeatures: true,
                },
            },
        },
        db.rawDatabase,
    );

    dummyAdmin = await app.services.userService.createUser({
        name: 'Some Name',
        email: 'test@getunleash.io',
        rootRole: RoleName.ADMIN,
    });
});

afterEach(async () => {
    const all = await db.stores.projectStore.getEnvironmentsForProject(
        'default',
    );
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
    );
    await app.services.projectService.createProject(
        { name: 'projectB', id: 'projectb' },
        dummyAdmin,
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
