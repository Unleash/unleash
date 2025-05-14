import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import type { IUnleashStores } from '../../../../lib/types/index.js';

let stores: IUnleashStores;
let db: ITestDb;
let app: IUnleashTest;

let scimUserId: number;
let regularUserId: number;
let scimDeletableUser: number;

const scimUser = {
    email: 'scim-user@test.com',
    name: 'SCIM User',
    scim_id: 'some-random-scim-id',
};

const regularUser = {
    email: 'regular-user@test.com',
    name: 'Regular User',
};

const scimUserToBeDeleted = {
    email: 'scim-victim@test.com',
    name: 'SCIM Victim',
    scim_id: 'some-other-random-scim-id',
};

const scimGuardErrorMessage =
    'This user is managed by your SCIM provider and cannot be changed manually';

beforeAll(async () => {
    db = await dbInit('user_admin_scim', getLogger);
    stores = db.stores;
    app = await setupAppWithCustomConfig(stores, {
        enterpriseVersion: 'enterprise',
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });

    await stores.settingStore.insert('scim', {
        enabled: true,
    });

    scimUserId = (
        await db.rawDatabase('users').insert(scimUser).returning('id')
    )[0].id;

    regularUserId = (
        await db.rawDatabase('users').insert(regularUser).returning('id')
    )[0].id;

    scimDeletableUser = (
        await db
            .rawDatabase('users')
            .insert(scimUserToBeDeleted)
            .returning('id')
    )[0].id;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('fetching a SCIM user should include scimId', async () => {
    const { body } = await app.request
        .get(`/api/admin/user-admin/${scimUserId}`)
        .expect(200);

    expect(body.email).toBe(scimUser.email);
    expect(body.scimId).toBe('some-random-scim-id');
});

test('fetching a regular user should not include scimId', async () => {
    const { body } = await app.request
        .get(`/api/admin/user-admin/${regularUserId}`)
        .expect(200);

    expect(body.email).toBe(regularUser.email);
    expect(body.scimId).toBeFalsy();
});

test('should prevent editing a SCIM user', async () => {
    const { body } = await app.request
        .put(`/api/admin/user-admin/${scimUserId}`)
        .send({
            name: 'New name',
        })
        .expect(403);

    expect(body.details[0].message).toBe(scimGuardErrorMessage);
});

test('should not prevent deleting a SCIM user', async () => {
    await app.request
        .delete(`/api/admin/user-admin/${scimDeletableUser}`)
        .expect(200);
});

test('should prevent changing password for a SCIM user', async () => {
    const { body } = await app.request
        .post(`/api/admin/user-admin/${scimUserId}/change-password`)
        .send({
            password: 'new-password',
        })
        .expect(403);

    expect(body.details[0].message).toBe(scimGuardErrorMessage);
});

test('should prevent resetting password for a SCIM user', async () => {
    const { body } = await app.request
        .post(`/api/admin/user-admin/reset-password`)
        .send({ id: scimUser.email })
        .expect(403);

    expect(body.details[0].message).toBe(scimGuardErrorMessage);
});
