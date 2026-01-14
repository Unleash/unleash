import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import {
    RoleName,
    TEST_AUDIT_USER,
    CREATE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    UPDATE_PROJECT_CONTEXT,
} from '../../../../lib/types/index.js';
import type { ICustomRole, IRole } from '../../../../lib/server-impl.js';

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

    await app.services.accessService.createRole(
        {
            name: 'no-project-context-perm',
            description: 'Role for testing project permissions',
            permissions: [
                {
                    name: UPDATE_CONTEXT_FIELD,
                },
            ],
            createdByUserId: TEST_AUDIT_USER.id,
        },
        TEST_AUDIT_USER,
    );

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

test('should create project context field with UPDATE_PROJECT_CONTEXT permission', async () => {
    const viewerRole = await db.stores.roleStore.getRoleByName(RoleName.VIEWER);

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

    const email = 'user@test.com';
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

    await app.request
        .post('/api/admin/projects/default/context')
        .send({ name: 'newContext' })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should update project context field with UPDATE_PROJECT_CONTEXT permission', async () => {
    const viewerRole = await db.stores.roleStore.getRoleByName(RoleName.VIEWER);

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

    const email = 'user@test.com';
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

    const contextName = 'newContext';
    await app.request
        .post('/api/admin/projects/default/context')
        .send({ name: contextName })
        .set('Content-Type', 'application/json');

    await app.request
        .put(`/api/admin/projects/default/context/${contextName}`)
        .send({ name: 'updated context' })
        .set('Content-Type', 'application/json')
        .expect(200);
});

describe('when a project context field is created with CREATE_CONTEXT_FIELD permission ', () => {
    let viewerRole: IRole;
    let createContextPerm: ICustomRole;
    const name = 'newContext';

    beforeEach(async () => {
        viewerRole = await db.stores.roleStore.getRoleByName(RoleName.VIEWER);

        createContextPerm = await app.services.accessService.createRole(
            {
                name: 'create-context-perm',
                description: 'Role for testing project permissions',
                permissions: [
                    {
                        name: CREATE_CONTEXT_FIELD,
                    },
                ],
                createdByUserId: TEST_AUDIT_USER.id,
            },
            TEST_AUDIT_USER,
        );

        const email = 'user@test.com';
        const user = await app.services.userService.createUser(
            { email, rootRole: viewerRole.id },
            TEST_AUDIT_USER,
        );

        await app.services.accessService.addUserToRole(
            user.id,
            createContextPerm.id,
            'default',
        );

        await app.request.post('/auth/demo/login').send({ email });

        await app.request
            .post('/api/admin/projects/default/context')
            .send({ name })
            .set('Content-Type', 'application/json');
    });

    it('should allow to update it with UPDATE_CONTEXT_FIELD', async () => {
        const email = 'user2@test.com';
        const user = await app.services.userService.createUser(
            { email, rootRole: viewerRole.id },
            TEST_AUDIT_USER,
        );

        const createContextFieldRole =
            await app.services.accessService.createRole(
                {
                    name: 'update-context-perm',
                    description: 'Role for testing project permissions',
                    permissions: [
                        {
                            name: UPDATE_CONTEXT_FIELD,
                        },
                    ],
                    createdByUserId: TEST_AUDIT_USER.id,
                },
                TEST_AUDIT_USER,
            );

        await app.services.accessService.addUserToRole(
            user.id,
            createContextFieldRole.id,
            'default',
        );

        await app.request.post('/auth/demo/login').send({ email });

        await app.request
            .put(`/api/admin/projects/default/context/${name}`)
            .send({ name: 'updated context' })
            .set('Content-Type', 'application/json')
            .expect(200);
    });
});
