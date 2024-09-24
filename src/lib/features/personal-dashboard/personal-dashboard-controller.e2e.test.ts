import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import type { IUser } from '../../types';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('personal_dashboard', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {},
            },
        },
        db.rawDatabase,
    );
});

const loginUser = (email: string) => {
    return app.request
        .post(`/auth/demo/login`)
        .send({
            email,
        })
        .expect(200);
};

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
});

test('should return personal dashboard with own flags and favorited flags', async () => {
    await loginUser('other_user@getunleash.io');
    await app.createFeature('other_feature_a');
    await app.createFeature('other_feature_b');

    await loginUser('my_user@getunleash.io');
    await app.createFeature('my_feature_c');
    await app.createFeature('my_feature_d');
    await app.favoriteFeature('other_feature_b');
    await app.favoriteFeature('my_feature_d');

    const { body } = await app.request.get(`/api/admin/personal-dashboard`);

    expect(body).toMatchObject({
        projects: [],
        flags: [
            { name: 'my_feature_d', type: 'release', project: 'default' },
            { name: 'my_feature_c', type: 'release', project: 'default' },
            { name: 'other_feature_b', type: 'release', project: 'default' },
        ],
    });
});

const createProject = async (name: string, user: IUser) => {
    const auditUser = {
        id: 1,
        username: 'audit user',
        ip: '127.0.0.1',
    };
    const project = await app.services.projectService.createProject(
        {
            name,
        },
        user,
        auditUser,
    );
    return project;
};

test('should return personal dashboard with membered projects', async () => {
    // create project A with user 1
    // create project B with user 1
    const { body: user1 } = await loginUser('user1@test.com');
    const projectA = await createProject('Project A', user1);
    await createProject('Project B', user1);

    // create project C with user 2
    const { body: user2 } = await loginUser('user2@test.com');
    const projectC = await createProject('Project C', user2);

    // Add user 2 as a member of project A
    await app.services.projectService.addAccess(
        projectA.id,
        [5],
        [],
        [user2.id],
        user1,
    );

    // Add user 1 as an owner of project C
    await app.services.projectService.addAccess(
        projectC.id,
        [4],
        [],
        [user1.id],
        user2,
    );

    const { body } = await app.request.get(`/api/admin/personal-dashboard`);

    expect(body).toMatchObject({
        projects: [
            {
                name: projectA.name,
                id: projectA.id,
                owners: [{ id: user1.id, name: user1.email, imageUrl: '' }],
                roles: ['member'],
            },
            {
                name: projectC.name,
                id: projectC.id,
                owners: [
                    { id: user2.id, name: user2.email, imageUrl: '' },
                    { id: user1.id, name: user1.email, imageUrl: '' },
                ],
                roles: ['owner'],
            },
        ],
    });
});

test('should return projects where users are part of a group', () => {
    // TODO
});
