import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import { DEFAULT_ENV } from '../../../util/index.js';
import {
    CREATE_FEATURE_STRATEGY,
    RoleName,
    TEST_AUDIT_USER,
} from '../../../types/index.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_strategy_auth_api_serial', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    anonymiseEventLog: true,
                },
            },
        },
        db.rawDatabase,
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

test('Should not be possible to update feature flag without permission', async () => {
    const email = 'user@mail.com';
    const url = '/api/admin/projects/default/features';
    const name = 'auth.flag.update';

    await db.stores.featureToggleStore.create('default', {
        name,
        createdByUserId: 9999,
    });

    await app.services.userService.createUser(
        {
            email,
            rootRole: RoleName.VIEWER,
        },
        TEST_AUDIT_USER,
    );

    await app.request.post('/auth/demo/login').send({
        email,
    });

    await app.request
        .put(`${url}/${name}`)
        .send({ name, description: 'updated', type: 'kill-switch' })
        .expect(403);
});

test('Should be possible to update feature flag with permission', async () => {
    const email = 'user2@mail.com';
    const url = '/api/admin/projects/default/features';
    const name = 'auth.flag.update2';

    await db.stores.featureToggleStore.create('default', {
        name,
        createdByUserId: 9999,
    });

    await app.services.userService.createUser(
        {
            email,
            rootRole: RoleName.EDITOR,
        },
        TEST_AUDIT_USER,
    );

    await app.request.post('/auth/demo/login').send({
        email,
    });

    await app.request
        .put(`${url}/${name}`)
        .send({ name, description: 'updated', type: 'kill-switch' })
        .expect(200);
});

test('Should not be possible auto-enable feature flag without CREATE_FEATURE_STRATEGY permission', async () => {
    const email = 'user33@mail.com';
    const url = '/api/admin/projects/default/features';
    const name = 'auth.flag.enable';

    await app.services.featureToggleService.createFeatureToggle(
        'default',
        { name },
        TEST_AUDIT_USER,
        true,
    );

    await app.services.userService.createUser(
        {
            email,
            rootRole: RoleName.EDITOR,
        },
        TEST_AUDIT_USER,
    );

    await app.request.post('/auth/demo/login').send({
        email,
    });

    const role = await db.stores.roleStore.getRoleByName(RoleName.EDITOR);

    await db.stores.accessStore.removePermissionFromRole(
        role.id,
        CREATE_FEATURE_STRATEGY,
        DEFAULT_ENV,
    );
    await app.request
        .post(`${url}/${name}/environments/${DEFAULT_ENV}/on`)
        .expect(403);
});

test('Should read flag creator and collaborators', async () => {
    const email = 'user@getunleash.io';
    const url = '/api/admin/projects/default/features/';
    const name = 'creator.flag';

    const user = await app.services.userService.createUser(
        {
            email,
            rootRole: RoleName.EDITOR,
        },
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name,
            createdByUserId: user.id,
        },
        { id: user.id, username: 'irrelevant', ip: '::1' },
    );

    await app.request.post('/auth/demo/login').send({
        email,
    });

    const { body: feature } = await app.request
        .get(`${url}/${name}`)
        .expect(200);

    const expectedUser = {
        id: user.id,
        name: '3957b71c0@unleash.run',
        imageUrl:
            'https://gravatar.com/avatar/3957b71c0a6d2528f03b423f432ed2efe855d263400f960248a1080493d9d68a?s=42&d=retro&r=g',
    };

    expect(feature.createdBy).toEqual(expectedUser);

    expect(feature.collaborators).toStrictEqual({
        users: [expectedUser],
    });
});
