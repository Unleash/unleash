import dbInit, { ITestDb } from '../../../helpers/database-init';
import { IUnleashTest, setupAppWithAuth } from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';
import { DEFAULT_ENV } from '../../../../../lib/util/constants';
import { RoleName } from '../../../../../lib/server-impl';
import { CREATE_FEATURE_STRATEGY } from '../../../../../lib/types/permissions';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_strategy_auth_api_serial', getLogger);
    app = await setupAppWithAuth(db.stores);
});

afterEach(async () => {
    const all = await db.stores.projectStore.getEnvironmentsForProject(
        'default',
    );
    await Promise.all(
        all
            .filter((env) => env !== DEFAULT_ENV)
            .map(async (env) =>
                db.stores.projectStore.deleteEnvironmentForProject(
                    'default',
                    env,
                ),
            ),
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Should not be possible to update feature toggle without permission', async () => {
    const email = 'user@mail.com';
    const url = '/api/admin/projects/default/features';
    const name = 'auth.toggle.update';

    await db.stores.featureToggleStore.create('default', { name });

    await app.services.userService.createUser({
        email,
        rootRole: RoleName.VIEWER,
    });

    await app.request.post('/auth/demo/login').send({
        email,
    });

    await app.request
        .put(`${url}/${name}`)
        .send({ name, description: 'updated', type: 'kill-switch' })
        .expect(403);
});

test('Should be possible to update feature toggle with permission', async () => {
    const email = 'user2@mail.com';
    const url = '/api/admin/projects/default/features';
    const name = 'auth.toggle.update2';

    await db.stores.featureToggleStore.create('default', { name });

    await app.services.userService.createUser({
        email,
        rootRole: RoleName.EDITOR,
    });

    await app.request.post('/auth/demo/login').send({
        email,
    });

    await app.request
        .put(`${url}/${name}`)
        .send({ name, description: 'updated', type: 'kill-switch' })
        .expect(200);
});

test('Should not be possible auto-enable feature toggle without CREATE_FEATURE_STRATEGY permission', async () => {
    const email = 'user33@mail.com';
    const url = '/api/admin/projects/default/features';
    const name = 'auth.toggle.enable';

    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        { name },
        'me',
        true,
    );

    await app.services.userService.createUser({
        email,
        rootRole: RoleName.EDITOR,
    });

    await app.request.post('/auth/demo/login').send({
        email,
    });

    const role = await db.stores.roleStore.getRoleByName(RoleName.EDITOR);

    await db.stores.accessStore.removePermissionFromRole(
        role.id,
        CREATE_FEATURE_STRATEGY,
        'default',
    );
    await app.request
        .post(`${url}/${name}/environments/default/on`)
        .expect(403);
});
