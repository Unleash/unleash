import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type { IUser } from '../../types/index.js';
import { randomId } from '../../util/index.js';

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

const favoriteProject = async (projectName = 'default') => {
    await app.request
        .post(`/api/admin/projects/${projectName}/favorites`)
        .set('Content-Type', 'application/json')
        .expect(200);
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
                health: 100,
                memberCount: 1,
                featureCount: 0,
            },
        ],
    });
});

test('should return personal dashboard with user favorited projects', async () => {
    const { body: user1 } = await loginUser('user1@test.com');
    const projectA = await createProject('Project A', user1);

    await loginUser('user2@test.com');
    await favoriteProject(projectA.id);

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
    const { body: user1 } = await loginUser('new_user@test.com');

    const project = await createProject(`x${randomId()}`, user1);
    const { body: user2 } = await loginUser('user2@test.com');
    await app.services.projectService.addAccess(
        project.id,
        [4], // owner role
        [],
        [user2.id],
        user1,
    );

    await loginUser(user1.email);

    await app.createFeature('log_feature_a', project.id);
    await app.createFeature('log_feature_b', project.id);
    await app.createFeature('log_feature_c', project.id);

    const { body } = await app.request.get(
        `/api/admin/personal-dashboard/${project.id}`,
    );

    const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    expect(body).toMatchObject({
        owners: [
            {
                email: user1.email,
                name: user1.email,
                ownerType: 'user',
            },
            {
                email: user2.email,
                name: user2.email,
                ownerType: 'user',
            },
        ],
        roles: [
            {
                id: 4,
                name: 'Owner',
                type: 'project',
            },
        ],
        insights: {
            avgHealthCurrentWindow: null,
            avgHealthPastWindow: null,
        },

        onboardingStatus: {
            status: 'first-flag-created',
            feature: 'log_feature_a',
        },
        latestEvents: [
            {
                createdAt: expect.stringMatching(timestampPattern),
                createdBy: 'new_user@test.com',
                summary: expect.stringContaining(
                    '**new_user@test.com** created **[log_feature_c]',
                ),
            },
            {
                createdAt: expect.stringMatching(timestampPattern),
                createdBy: 'new_user@test.com',
                summary: expect.stringContaining(
                    '**new_user@test.com** created **[log_feature_b]',
                ),
            },
            {
                createdAt: expect.stringMatching(timestampPattern),
                createdBy: 'new_user@test.com',
                summary: expect.stringContaining(
                    '**new_user@test.com** created **[log_feature_a]',
                ),
            },
            {
                createdAt: expect.stringMatching(timestampPattern),
                createdBy: 'unknown',
                summary: expect.stringContaining(
                    'triggered **project-access-added**',
                ),
            },
            {
                createdAt: expect.stringMatching(timestampPattern),
                createdBy: 'audit user',
                summary: expect.stringContaining(
                    '**audit user** created project',
                ),
            },
        ],
    });

    const insertHealthScore = (id: string, health: number) => {
        const irrelevantFlagTrendDetails = {
            total_flags: 10,
            stale_flags: 10,
            potentially_stale_flags: 10,
        };
        return db.rawDatabase('flag_trends').insert({
            ...irrelevantFlagTrendDetails,
            id,
            project: project.id,
            health,
        });
    };

    await insertHealthScore('2024-01', 80);
    await insertHealthScore('2024-02', 80);
    await insertHealthScore('2024-03', 80);
    await insertHealthScore('2024-04', 81);

    await insertHealthScore('2024-05', 90);
    await insertHealthScore('2024-06', 91);
    await insertHealthScore('2024-07', 91);
    await insertHealthScore('2024-08', 91);

    const { body: bodyWithHealthScores } = await app.request.get(
        `/api/admin/personal-dashboard/${project.id}`,
    );

    expect(bodyWithHealthScores).toMatchObject({
        insights: {
            avgHealthPastWindow: 80,
            avgHealthCurrentWindow: 91,
            totalFlags: 3,
            potentiallyStaleFlags: 0,
            staleFlags: 0,
            activeFlags: 3,
            health: 100,
        },
    });
});

test("should return 404 if the project doesn't exist", async () => {
    await loginUser('new_user@test.com');

    await app.request
        .get(`/api/admin/personal-dashboard/${randomId()}`)
        .expect(404);
});

test('should return Unleash admins', async () => {
    await loginUser('new_user@test.com');
    const adminRoleId = 1;
    const userService = app.services.userService;

    const admin = await userService.createUser({
        username: 'admin',
        rootRole: adminRoleId,
    });
    const admin2 = await userService.createUser({
        username: 'John',
        name: 'John Admin',
        rootRole: adminRoleId,
    });

    // service account that shouldn't be listed in the output. Service
    // accounts are enterprise functionality, so there's no service to
    // call here
    const [{ id: serviceAdminId }] = await db
        .rawDatabase('users')
        .insert({
            username: 'service_admin',
            is_service: true,
        })
        .returning('*');
    await app.services.accessService.setUserRootRole(
        serviceAdminId,
        adminRoleId,
    );

    const { body } = await app.request.get(`/api/admin/personal-dashboard`);

    expect(body.admins).toMatchObject([
        {
            id: admin.id,
            username: admin.username,
            imageUrl: expect.stringMatching(/^https:\/\/gravatar.com/),
        },
        {
            id: admin2.id,
            name: admin2.name,
            username: admin2.username,
            imageUrl: expect.stringMatching(/^https:\/\/gravatar.com/),
        },
    ]);
});

test('should return System owner for default project if nothing else is set', async () => {
    await loginUser('new_user@test.com');

    const { body } = await app.request.get(
        `/api/admin/personal-dashboard/default`,
    );

    expect(body.owners).toMatchObject([
        {
            ownerType: 'system',
        },
    ]);
});
