import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { RoleName } from '../../../../lib/types/model.js';
import type { IUnleashStores } from '../../../../lib/types/index.js';

let db: ITestDb;
let app: IUnleashTest;
let stores: IUnleashStores;
let editorRoleId: number;
let adminRoleId: number;

const createUser = async (email: string, rootRole: number): Promise<number> => {
    const { body } = await app.request
        .post('/api/admin/user-admin')
        .send({ email, name: email.split('@')[0], rootRole })
        .set('Content-Type', 'application/json')
        .expect(201);
    return body.id;
};

beforeAll(async () => {
    db = await dbInit('user_access_log_api_serial', getLogger);
    stores = db.stores;
    app = await setupAppWithCustomConfig(
        stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
    const roles = await stores.roleStore.getRootRoles();
    editorRoleId = roles.find((r) => r.name === RoleName.EDITOR)!.id;
    adminRoleId = roles.find((r) => r.name === RoleName.ADMIN)!.id;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

afterEach(async () => {
    await stores.userStore.deleteAll();
    await stores.eventStore.deleteAll();
});

test('returns an access log with added and removed users', async () => {
    const activeId = await createUser('active@example.com', editorRoleId);
    const removedId = await createUser('removed@example.com', adminRoleId);

    await app.request.delete(`/api/admin/user-admin/${removedId}`).expect(200);

    const { body } = await app.request
        .get('/api/admin/user-admin/access-log')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.total).toBe(2);
    expect(body.items).toHaveLength(2);

    const active = body.items.find((i) => i.id === activeId);
    const removed = body.items.find((i) => i.id === removedId);

    expect(active).toMatchObject({
        status: 'added',
        roleName: RoleName.EDITOR,
    });
    expect(active.createdAt).toBeTruthy();
    expect(active.removedAt).toBeNull();

    expect(removed).toMatchObject({
        status: 'removed',
        roleName: RoleName.ADMIN,
    });
    expect(removed.createdAt).toBeTruthy();
    expect(removed.removedAt).toBeTruthy();
    // performedBy should be the admin actor of the delete
    expect(removed.performedBy).not.toBeNull();
});

test('paginates and sorts by createdAt', async () => {
    const firstId = await createUser('first@example.com', editorRoleId);
    // ensure distinct created_at ordering
    await new Promise((r) => setTimeout(r, 20));
    const secondId = await createUser('second@example.com', editorRoleId);

    const ascPage1 = await app.request
        .get(
            '/api/admin/user-admin/access-log?sortBy=createdAt&sortOrder=asc&limit=1&offset=0',
        )
        .expect(200);
    expect(ascPage1.body.total).toBe(2);
    expect(ascPage1.body.items).toHaveLength(1);
    expect(ascPage1.body.items[0].id).toBe(firstId);

    const ascPage2 = await app.request
        .get(
            '/api/admin/user-admin/access-log?sortBy=createdAt&sortOrder=asc&limit=1&offset=1',
        )
        .expect(200);
    expect(ascPage2.body.items).toHaveLength(1);
    expect(ascPage2.body.items[0].id).toBe(secondId);

    const desc = await app.request
        .get('/api/admin/user-admin/access-log?sortBy=createdAt&sortOrder=desc')
        .expect(200);
    expect(desc.body.items.map((i) => i.id)).toEqual([secondId, firstId]);
});
