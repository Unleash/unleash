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

const favoriteFeature = async (featureName: string) => {
    await app.request
        .post(`/api/admin/projects/default/features/${featureName}/favorites`)
        .set('Content-Type', 'application/json')
        .expect(200);
};

const unfavoriteFeature = async (featureName: string) => {
    await app.request
        .delete(`/api/admin/projects/default/features/${featureName}/favorites`)
        .set('Content-Type', 'application/json')
        .expect(200);
};

const favoriteProject = async (projectName = 'default') => {
    await app.request
        .post(`/api/admin/projects/${projectName}/favorites`)
        .set('Content-Type', 'application/json')
        .expect(200);
};

const unfavoriteProject = async (projectName = 'default') => {
    await app.request
        .delete(`/api/admin/projects/${projectName}/favorites`)
        .set('Content-Type', 'application/json')
        .expect(200);
};

const getProject = async (projectName = 'default') => {
    return app.request
        .get(`/api/admin/projects/${projectName}`)
        .set('Content-Type', 'application/json')
        .expect(200);
};

const getProjects = async () => {
    return app.request
        .get(`/api/admin/projects`)
        .set('Content-Type', 'application/json')
        .expect(200);
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

test('should be favorited in project endpoint', async () => {
    const featureName = 'test-feature';
    await createFeature(featureName);
    await favoriteFeature(featureName);
    await favoriteProject();

    const { body } = await app.request
        .get(`/api/admin/projects/default`)
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body).toMatchObject({
        favorite: true,
        features: [
            {
                name: featureName,
                favorite: true,
            },
        ],
    });
});

test('feature should not be favorited by default', async () => {
    const featureName = 'test-feature';
    await createFeature(featureName);

    const { body } = await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body).toMatchObject({
        name: featureName,
        favorite: false,
    });
});

test('should be favorited in admin endpoint', async () => {
    const featureName = 'test-feature';
    await createFeature(featureName);
    await favoriteFeature(featureName);

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

test('should be favorited in project single feature endpoint', async () => {
    const featureName = 'test-feature';
    await createFeature(featureName);
    await favoriteFeature(featureName);

    const { body } = await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body).toMatchObject({
        name: featureName,
        favorite: true,
    });
});

test('should be able to unfavorite feature', async () => {
    const featureName = 'test-feature';
    await createFeature(featureName);
    await favoriteFeature(featureName);
    await unfavoriteFeature(featureName);

    const { body } = await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body).toMatchObject({
        name: featureName,
        favorite: false,
    });
});

test('should be favorited in projects list', async () => {
    await favoriteProject();

    const { body } = await getProjects();

    expect(body.projects).toHaveLength(1);
    expect(body.projects[0]).toMatchObject({
        name: 'Default',
        favorite: true,
    });
});

test('should be favorited in single project endpoint', async () => {
    await favoriteProject();

    const { body } = await getProject();

    expect(body).toMatchObject({
        name: 'Default',
        favorite: true,
    });
});

test('project should not be favorited by default', async () => {
    await favoriteProject();
    await unfavoriteProject();

    const { body } = await getProject();

    expect(body).toMatchObject({
        name: 'Default',
        favorite: false,
    });
});
