import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    createUserWithRootRole,
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import {
    type IUser,
    RoleName,
    TEST_AUDIT_USER,
    UPDATE_PROJECT_ADDON,
} from '../../../../lib/types/index.js';

let db: ITestDb;
let app: IUnleashTest;

const addonConfig = ({
    enabled = true,
    projects,
}: {
    enabled?: boolean;
    projects?: string[];
} = {}) => ({
    provider: 'webhook',
    enabled,
    parameters: { url: 'http://localhost:4242/webhook' },
    events: ['feature-created'],
    projects,
});

const createUser = async (email: string, roleName: RoleName) => {
    const user = await createUserWithRootRole({
        app,
        stores: db.stores,
        email,
        roleName,
    });

    return { ...user, email };
};

const createProject = (id: string, createdBy: IUser) =>
    app.services.projectService.createProject(
        { id, name: id },
        createdBy,
        TEST_AUDIT_USER,
    );

const createUserWithProjectPermission = async (
    email: string,
    project: string,
    permission: string,
) => {
    const user = await createUser(email, RoleName.VIEWER);
    const role = await app.services.accessService.createRole(
        {
            name: `${permission}-on-${project}`,
            description: 'Role for testing project permissions',
            permissions: [{ name: permission }],
            createdByUserId: TEST_AUDIT_USER.id,
        },
        TEST_AUDIT_USER,
    );

    await app.services.accessService.addUserToRole(user.id, role.id, project);

    return user;
};

const createProjectOwner = async (email: string, project: string) => {
    const user = await createUser(email, RoleName.VIEWER);
    const ownerRole = await db.stores.roleStore.getRoleByName(RoleName.OWNER);

    await app.services.accessService.addUserToRole(
        user.id,
        ownerRole.id,
        project,
    );

    return user;
};

beforeAll(async () => {
    db = await dbInit('project_addon_api_serial', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        { allowPrivateUrlInIntegration: true },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should reject creating a project integration without permission', async () => {
    const viewer = await createUser('viewer@getunleash.io', RoleName.VIEWER);

    await app.login({ email: viewer.email });

    await app.request
        .post('/api/admin/projects/default/addons')
        .send(addonConfig())
        .expect(403);
});

test('should allow a project owner to create and update integrations', async () => {
    const owner = await createProjectOwner('owner@getunleash.io', 'default');

    await app.login({ email: owner.email });

    const { body: created } = await app.request
        .post('/api/admin/projects/default/addons')
        .send(addonConfig({ projects: ['somewhere-else'] }))
        .expect(201);

    expect(created.projects).toStrictEqual(['default']);

    await app.request
        .put(`/api/admin/projects/default/addons/${created.id}`)
        .send(addonConfig({ enabled: false }))
        .expect(200)
        .expect((res) => {
            expect(res.body.enabled).toBe(false);
        });
});

test('should allow the UPDATE_PROJECT_ADDON permission alone to create and update integrations', async () => {
    const user = await createUserWithProjectPermission(
        'project-addon-perm@getunleash.io',
        'default',
        UPDATE_PROJECT_ADDON,
    );

    await app.login({ email: user.email });

    const { body: created } = await app.request
        .post('/api/admin/projects/default/addons')
        .send(addonConfig())
        .expect(201);

    expect(created.projects).toStrictEqual(['default']);

    await app.request
        .put(`/api/admin/projects/default/addons/${created.id}`)
        .send(addonConfig({ enabled: false }))
        .expect(200);
});

test('should not allow a project owner to delete integrations', async () => {
    const owner = await createProjectOwner(
        'owner-delete@getunleash.io',
        'default',
    );

    await app.login({ email: owner.email });

    const { body: created } = await app.request
        .post('/api/admin/projects/default/addons')
        .send(addonConfig())
        .expect(201);

    await app.request.delete(`/api/admin/addons/${created.id}`).expect(403);
});

test("should not allow a project owner to touch another project's integrations", async () => {
    const admin = await createUser('admin-other@getunleash.io', RoleName.ADMIN);
    const other = await createProject('other-project', admin);

    const owner = await createProjectOwner(
        'owner-other@getunleash.io',
        'default',
    );

    await app.login({ email: owner.email });

    await app.request
        .post(`/api/admin/projects/${other.id}/addons`)
        .send(addonConfig())
        .expect(403);
});

test('should not update an integration belonging to another project', async () => {
    const admin = await createUser('admin-cross@getunleash.io', RoleName.ADMIN);

    await app.login({ email: admin.email });

    const { body: elsewhere } = await app.request
        .post('/api/admin/addons')
        .send(addonConfig({ projects: ['somewhere-else'] }))
        .expect(201);

    const owner = await createProjectOwner(
        'owner-cross@getunleash.io',
        'default',
    );

    await app.login({ email: owner.email });

    await app.request
        .put(`/api/admin/projects/default/addons/${elsewhere.id}`)
        .send(addonConfig())
        .expect(404);
});

test("should only list the project's own integrations", async () => {
    const admin = await createUser('admin-list@getunleash.io', RoleName.ADMIN);

    await app.login({ email: admin.email });

    const { body: scoped } = await app.request
        .post('/api/admin/projects/default/addons')
        .send(addonConfig())
        .expect(201);

    const { body: shared } = await app.request
        .post('/api/admin/addons')
        .send(addonConfig({ projects: ['default', 'somewhere-else'] }))
        .expect(201);

    const { body: instanceWide } = await app.request
        .post('/api/admin/addons')
        .send(addonConfig({ projects: [] }))
        .expect(201);

    await app.request
        .get('/api/admin/projects/default/addons')
        .expect(200)
        .expect((res) => {
            const ids = res.body.addons.map((addon) => addon.id);

            expect(ids).toContain(scoped.id);
            expect(ids).not.toContain(shared.id);
            expect(ids).not.toContain(instanceWide.id);
            expect(res.body.providers.length).toBeGreaterThan(0);
        });
});

test('should allow a user with root addon permissions to use the project resource', async () => {
    const editor = await createUser('editor@getunleash.io', RoleName.EDITOR);

    await app.login({ email: editor.email });

    const { body: created } = await app.request
        .post('/api/admin/projects/default/addons')
        .send(addonConfig())
        .expect(201);

    await app.request
        .put(`/api/admin/projects/default/addons/${created.id}`)
        .send(addonConfig({ enabled: false }))
        .expect(200);
});
