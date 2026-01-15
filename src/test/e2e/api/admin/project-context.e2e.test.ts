import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import {
    RoleName,
    TEST_AUDIT_USER,
    UPDATE_PROJECT_CONTEXT,
} from '../../../../lib/types/index.js';

let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('context_api_serial', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    projectContextFields: true,
                },
            },
        },
        db.rawDatabase,
    );
});

test('should reject creating a project context field without permission', async () => {
    const viewerRole = await db.stores.roleStore.getRoleByName(RoleName.VIEWER);

    const email = 'user@test.com';
    await app.services.userService.createUser(
        { email, rootRole: viewerRole.id },
        TEST_AUDIT_USER,
    );

    await app.request.post('/auth/demo/login').send({ email });

    await app.request
        .post('/api/admin/projects/default/context')
        .send({ name: 'newContext' })
        .set('Content-Type', 'application/json')
        .expect(403);
});

describe('with UPDATE_PROJECT_CONTEXT permission', () => {
    it('allows to perform CRUD operations', async () => {
        const viewerRole = await db.stores.roleStore.getRoleByName(
            RoleName.VIEWER,
        );

        const updateProjectContextPerm =
            await app.services.accessService.createRole(
                {
                    name: 'update-project-context-perm',
                    description: 'Role for testing project permissions',
                    permissions: [
                        {
                            name: UPDATE_PROJECT_CONTEXT,
                        },
                    ],
                    createdByUserId: TEST_AUDIT_USER.id,
                },
                TEST_AUDIT_USER,
            );

        const email = 'updateprojectcontext@test.com';
        const user = await app.services.userService.createUser(
            { email, rootRole: viewerRole.id },
            TEST_AUDIT_USER,
        );

        await app.services.accessService.addUserToRole(
            user.id,
            updateProjectContextPerm.id,
            'default',
        );

        await app.request.post('/auth/demo/login').send({ email });

        const res = await app.request
            .post('/api/admin/projects/default/context')
            .send({ name: 'newContext' })
            .set('Content-Type', 'application/json')
            .expect(201);

        const context = res.body;

        await app.request
            .get(`/api/admin/projects/default/context/${context.name}`)
            .set('Content-Type', 'application/json')
            .expect(200);

        await app.request
            .put(`/api/admin/projects/default/context/${context.name}`)
            .send({ name: 'updated context' })
            .set('Content-Type', 'application/json')
            .expect(200);

        await app.request
            .delete(`/api/admin/projects/default/context/${context.name}`)
            .set('Content-Type', 'application/json')
            .expect(200);
    });
});

describe('with Editor role', () => {
    it('allows to perform CRUD operations on a new project', async () => {
        const editorRole = await db.stores.roleStore.getRoleByName(
            RoleName.EDITOR,
        );

        const dummyAdmin = await app.services.userService.createUser(
            {
                name: 'Some Name',
                email: 'test@getunleash.io',
                rootRole: RoleName.ADMIN,
            },
            TEST_AUDIT_USER,
        );

        const newProject = await app.services.projectService.createProject(
            {
                id: 'new-project',
                name: 'New Project',
            },
            dummyAdmin,
            TEST_AUDIT_USER,
        );

        const email = 'editoruser@test.com';
        await app.services.userService.createUser(
            { email, rootRole: editorRole.id },
            TEST_AUDIT_USER,
        );

        await app.request.post('/auth/demo/login').send({ email });

        const res = await app.request
            .post(`/api/admin/projects/${newProject.id}/context`)
            .send({ name: 'newContext' })
            .set('Content-Type', 'application/json')
            .expect(201);

        const context = res.body;

        await app.request
            .get(`/api/admin/projects/${newProject.id}/context/${context.name}`)
            .set('Content-Type', 'application/json')
            .expect(200);

        await app.request
            .put(`/api/admin/projects/${newProject.id}/context/${context.name}`)
            .send({ name: 'updated context' })
            .set('Content-Type', 'application/json')
            .expect(200);

        await app.request
            .delete(
                `/api/admin/projects/${newProject.id}/context/${context.name}`,
            )
            .set('Content-Type', 'application/json')
            .expect(200);
    });
});
