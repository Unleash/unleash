import { NextFunction } from 'express';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init';
import {
    setupAppWithCustomConfig,
    type IUnleashTest,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';
import type { IUnleashOptions } from '../../../types/option';
import type { IWorkspace } from '../workspaces-types';

let app: IUnleashTest;
let db: ITestDb;

const TEST_USER_ID = 1;

beforeAll(async () => {
    const config: Partial<IUnleashOptions> = {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
        preHook: (app: any) => {
            app.use(
                '/api/admin/workspaces',
                (req: Request, res: Response, next: NextFunction) => {
                    req.user = {
                        id: TEST_USER_ID,
                        username: 'test@test.com',
                        permissions: ['ADMIN'],
                    };
                    next();
                },
            );
        },
    };

    db = await dbInit('workspaces_api', getLogger, config);
    app = await setupAppWithCustomConfig(db.stores, config, db.rawDatabase);

    // Create a test user with the same ID we use in the middleware
    await db.stores.userStore.insert({
        name: 'Test User',
        username: 'test@test.com',
    });

    const adminRole = await db.stores.roleStore.getRoleByName('Admin');

    await db.stores.accessStore.addUserToRole(
        TEST_USER_ID,
        adminRole.id,
        'default',
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should create and get workspace', async () => {
    const workspace = {
        name: 'Test Workspace',
        description: 'Test workspace description',
    };

    const createResponse = await app.request
        .post('/api/admin/workspaces')
        .send(workspace)
        .expect(201);

    const created = createResponse.body;
    expect(created.name).toBe(workspace.name);
    expect(created.description).toBe(workspace.description);
    expect(created.id).toBeDefined();

    const getResponse = await app.request
        .get(`/api/admin/workspaces/${created.id}`)
        .expect(200);

    expect(getResponse.body).toMatchObject(workspace);
});

test('should get all workspaces', async () => {
    const workspace = {
        name: 'Another Workspace',
        description: 'Another test workspace',
    };

    await app.request.post('/api/admin/workspaces').send(workspace).expect(201);

    const response = await app.request.get('/api/admin/workspaces').expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(
        response.body.some((w: IWorkspace) => w.name === workspace.name),
    ).toBe(true);
});

test('should update workspace', async () => {
    const workspace = {
        name: 'Update Test',
        description: 'Will be updated',
    };

    const createResponse = await app.request
        .post('/api/admin/workspaces')
        .send(workspace)
        .expect(201);

    const updated = {
        name: 'Updated Name',
        description: 'Updated description',
    };

    await app.request
        .put(`/api/admin/workspaces/${createResponse.body.id}`)
        .send(updated)
        .expect(200);

    const getResponse = await app.request
        .get(`/api/admin/workspaces/${createResponse.body.id}`)
        .expect(200);

    expect(getResponse.body.name).toBe(updated.name);
    expect(getResponse.body.description).toBe(updated.description);
});

test('should delete workspace', async () => {
    const workspace = {
        name: 'To be deleted',
        description: 'Will be deleted',
    };

    const createResponse = await app.request
        .post('/api/admin/workspaces')
        .send(workspace)
        .expect(201);

    await app.request
        .delete(`/api/admin/workspaces/${createResponse.body.id}`)
        .expect(200);

    await app.request
        .get(`/api/admin/workspaces/${createResponse.body.id}`)
        .expect(404);
});

test('should not delete default workspace', async () => {
    await app.request.delete('/api/admin/workspaces/1').expect(400);
});

test('should validate workspace name', async () => {
    const workspace = {
        name: 'Invalid Name!@#',
        description: 'Invalid workspace name',
    };

    await app.request.post('/api/admin/workspaces').send(workspace).expect(400);
});
