import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import type { IUser } from '../../types';
import { randomId } from '../../util';

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
    await db.stores.userStore.deleteAll();
    await db.stores.eventStore.deleteAll();
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
    const { body: user1 } = await loginUser('user1@test.com');
    const projectA = await createProject('Project A', user1);
    await createProject('Project B', user1);

    const { body: user2 } = await loginUser('user2@test.com');
    const projectC = await createProject('Project C', user2);

    await app.services.projectService.addAccess(
        projectA.id,
        [5], // member role
        [],
        [user2.id],
        user1,
    );

    const { body } = await app.request.get(`/api/admin/personal-dashboard`);

    expect(body).toMatchObject({
        projects: [
            {
                name: 'Default',
                id: 'default',
                health: 100,
                memberCount: 0,
                featureCount: 0,
            },
            {
                name: projectA.name,
                id: projectA.id,
                health: 100,
                memberCount: 2,
                featureCount: 0,
            },
            {
                name: projectC.name,
                id: projectC.id,
                memberCount: 1,
                featureCount: 0,
            },
        ],
    });
});

test('should return projects where users are part of a group', async () => {
    const { body: user1 } = await loginUser('user1@test.com');
    const projectA = await createProject(`x${randomId()}`, user1);

    const { body: user2 } = await loginUser('user2@test.com');

    const group = await app.services.groupService.createGroup(
        {
            name: 'groupA',
            users: [{ user: user2 }],
        },
        user1,
    );

    await app.services.projectService.addAccess(
        projectA.id,
        [5], // member role
        [],
        [user2.id],
        user1,
    );

    await app.services.projectService.addAccess(
        projectA.id,
        [4], // owner role
        [group.id],
        [],
        user1,
    );

    const { body } = await app.request.get(`/api/admin/personal-dashboard`);

    expect(body).toMatchObject({
        projects: [
            {
                name: 'Default',
                id: 'default',
                health: 100,
                memberCount: 0,
                featureCount: 0,
            },
            {
                name: projectA.name,
                id: projectA.id,
                health: 100,
                memberCount: 2,
                featureCount: 0,
            },
        ],
    });
});

test('should return personal dashboard project details', async () => {
    await loginUser('new_user@test.com');

    await app.createFeature('log_feature_a');
    await app.createFeature('log_feature_b');
    await app.createFeature('log_feature_c');

    const { body } = await app.request.get(
        `/api/admin/personal-dashboard/default`,
    );

    expect(body).toMatchObject({
        owners: [{}],
        roles: [{}],
        latestEvents: [
            {
                createdBy: 'new_user@test.com',
                summary:
                    '**new_user@test.com** created **[log_feature_c](http://localhost:4242/projects/default/features/log_feature_c)** in project **[default](http://localhost:4242/projects/default)**',
            },
            {
                createdBy: 'new_user@test.com',
                summary:
                    '**new_user@test.com** created **[log_feature_b](http://localhost:4242/projects/default/features/log_feature_b)** in project **[default](http://localhost:4242/projects/default)**',
            },
            {
                createdBy: 'new_user@test.com',
                summary:
                    '**new_user@test.com** created **[log_feature_a](http://localhost:4242/projects/default/features/log_feature_a)** in project **[default](http://localhost:4242/projects/default)**',
            },
            {
                createdBy: 'unleash_system_user',
                summary: '**unleash_system_user** created user ****',
            },
        ],
    });
});
