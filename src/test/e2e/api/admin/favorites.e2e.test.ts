import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import { IUnleashStores, RoleName } from '../../../../lib/types';
import { AccessService } from '../../../../lib/services';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;
let stores: IUnleashStores;
let accessService: AccessService;
let editorRole;

const regularUserName = 'favorites-user';

const createFeature = async (featureName: string) => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: featureName,
        })
        .set('Content-Type', 'application/json')
        .expect(201);

    // await projectService.addEnvironmentToProject('default', environment);
};

const loginRegularUser = () =>
    app.request
        .post(`/auth/demo/login`)
        .send({
            email: `${regularUserName}@getunleash.io`,
        })
        .expect(200);

const createUserEditorAccess = async (name, email) => {
    const { userStore } = stores;
    const user = await userStore.insert({ name, email });
    await accessService.addUserToRole(user.id, editorRole.id, 'default');
    return user;
};

beforeAll(async () => {
    db = await dbInit('favorites_api_serial', getLogger);
    app = await setupAppWithAuth(db.stores);
    stores = db.stores;
    accessService = app.services.accessService;

    const roles = await accessService.getRootRoles();
    editorRole = roles.find((role) => role.name === RoleName.EDITOR);

    await createUserEditorAccess(
        regularUserName,
        `${regularUserName}@getunleash.io`,
    );
});

afterAll(async () => {
    await app.destroy();
});

afterEach(async () => {
    await db.stores.favoriteFeaturesStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
});

beforeEach(async () => {
    await loginRegularUser();
});

test('should have favorites true in project endpoint', async () => {
    const featureName = 'test-feature';
    await createFeature(featureName);

    await app.request
        .post(`/api/admin/projects/default/features/${featureName}/favorites`)
        .set('Content-Type', 'application/json')
        .expect(200);

    const { body } = await app.request
        .get(`/api/admin/projects/default/features`)
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body.features).toHaveLength(1);
    expect(body.features[0]).toMatchObject({
        name: featureName,
        favorite: true,
    });
});

test('should have favorites false by default', async () => {
    const featureName = 'test-feature';
    await createFeature(featureName);

    const { body } = await app.request
        .get(`/api/admin/projects/default/features`)
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body.features).toHaveLength(1);
    expect(body.features[0]).toMatchObject({
        name: featureName,
        favorite: false,
    });
});

test('should have favorites true in admin endpoint', async () => {
    const featureName = 'test-feature';
    await createFeature(featureName);

    await app.request
        .post(`/api/admin/projects/default/features/${featureName}/favorites`)
        .set('Content-Type', 'application/json')
        .expect(200);

    const { body } = await app.request
        .get(`/api/admin/features`)
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body.features).toHaveLength(1);
    expect(body.features[0]).toMatchObject({
        name: featureName,
        favorite: true,
    });
});

test('should have favorites true in project single feature endpoint', async () => {
    const featureName = 'test-feature';
    await createFeature(featureName);

    await app.request
        .post(`/api/admin/projects/default/features/${featureName}/favorites`)
        .set('Content-Type', 'application/json')
        .expect(200);

    const { body } = await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body).toMatchObject({
        name: featureName,
        favorite: true,
    });
});

test('should have favorites false after deleting favorite', async () => {
    const featureName = 'test-feature';
    await createFeature(featureName);

    await app.request
        .post(`/api/admin/projects/default/features/${featureName}/favorites`)
        .set('Content-Type', 'application/json')
        .expect(200);

    await app.request
        .delete(`/api/admin/projects/default/features/${featureName}/favorites`)
        .set('Content-Type', 'application/json')
        .expect(200);

    const { body } = await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body).toMatchObject({
        name: featureName,
        favorite: false,
    });
});
