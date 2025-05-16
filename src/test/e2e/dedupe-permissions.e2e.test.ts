import { getDbConfig } from './helpers/database-config.js';
import { createTestConfig } from '../config/test-config.js';
import { getInstance } from 'db-migrate';
import { log } from 'db-migrate-shared';
import postgresPkg from 'pg';
const { Client } = postgresPkg;
import type { IDBOption } from '../../lib/types/index.js';
import { fileURLToPath } from 'node:url';
import path from 'path';

log.setLogLevel('error');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function initSchema(db: IDBOption): Promise<void> {
    const client = new Client(db);
    await client.connect();
    await client.query(`DROP SCHEMA IF EXISTS ${db.schema} CASCADE`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${db.schema}`);
    await client.end();
}

test('Dedupe permissions migration correctly dedupes permissions', async () => {
    const config = createTestConfig({
        db: {
            ...getDbConfig(),
            pool: { min: 1, max: 4 },
            schema: 'dedupe_permissions_test',
            ssl: false,
        },
    });

    await initSchema(config.db);

    const custom = {
        ...config.db,
        connectionTimeoutMillis: 2000,
    };

    // disable Intellij/WebStorm from setting verbose CLI argument to db-migrator
    process.argv = process.argv.filter((it) => !it.includes('--verbose'));
    const dbm = getInstance(true, {
        cwd: `${__dirname}/../../`, // relative to src/test/e2e
        config: { custom },
        env: 'custom',
    });

    dbm.config.custom = custom;

    // Run all migrations up to, and including, this one, the last one before the dedupe migration
    await dbm.up('20231121153304-add-permission-create-tag-type.js');

    // Set up the test data
    const client = new Client(config.db);
    await client.connect();
    await client.query(`
        DELETE FROM "dedupe_permissions_test"."roles";

        INSERT INTO "dedupe_permissions_test"."roles" (id, name, description, type) VALUES (101, 'Role 1', 'A test role', 'custom');
        INSERT INTO "dedupe_permissions_test"."roles" (id, name, description, type) VALUES (102, 'Role 2', 'A test role', 'custom');
        INSERT INTO "dedupe_permissions_test"."roles" (id, name, description, type) VALUES (103, 'Role 3', 'A test role', 'custom');
        INSERT INTO "dedupe_permissions_test"."roles" (id, name, description, type) VALUES (104, 'Role 4', 'A test role', 'custom');
    `);
    await client.query(`
        DELETE FROM "dedupe_permissions_test"."permissions";

        INSERT INTO "dedupe_permissions_test"."permissions" (id, permission, display_name, type) VALUES (101, 'TEST_PERMISSION_1', 'A test permission', 'root');
        INSERT INTO "dedupe_permissions_test"."permissions" (id, permission, display_name, type) VALUES (102, 'TEST_PERMISSION_DUPLICATE_1', 'A test permission', 'root');
        INSERT INTO "dedupe_permissions_test"."permissions" (id, permission, display_name, type) VALUES (103, 'TEST_PERMISSION_DUPLICATE_1', 'A test permission', 'root');
        INSERT INTO "dedupe_permissions_test"."permissions" (id, permission, display_name, type) VALUES (104, 'TEST_PERMISSION_2', 'A test permission', 'root');
        INSERT INTO "dedupe_permissions_test"."permissions" (id, permission, display_name, type) VALUES (105, 'TEST_PERMISSION_3', 'A test permission', 'root');
        INSERT INTO "dedupe_permissions_test"."permissions" (id, permission, display_name, type) VALUES (106, 'TEST_PERMISSION_DUPLICATE_2', 'A test permission', 'root');
        INSERT INTO "dedupe_permissions_test"."permissions" (id, permission, display_name, type) VALUES (107, 'TEST_PERMISSION_DUPLICATE_2', 'A test permission', 'root');
        INSERT INTO "dedupe_permissions_test"."permissions" (id, permission, display_name, type) VALUES (108, 'TEST_PERMISSION_4', 'A test permission', 'root');
        INSERT INTO "dedupe_permissions_test"."permissions" (id, permission, display_name, type) VALUES (109, 'TEST_PERMISSION_DUPLICATE_3', 'A test permission', 'root');
        INSERT INTO "dedupe_permissions_test"."permissions" (id, permission, display_name, type) VALUES (110, 'TEST_PERMISSION_DUPLICATE_3', 'A test permission', 'root');
    `);
    await client.query(`
        DELETE FROM "dedupe_permissions_test"."role_permission";

        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (101, 101);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (101, 102);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (101, 103);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (101, 104);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (101, 105);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (101, 106);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (101, 107);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (101, 108);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (101, 109);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (101, 110);

        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (102, 102);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (102, 103);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (102, 106);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (102, 107);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (102, 109);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (102, 110);

        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (103, 101);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (103, 104);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (103, 105);
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, permission_id) VALUES (103, 108);

        -- Duplicate permission assignments, where role_id, permission_id, and environment are the same, as they should be deduped to the min created_at
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, created_at, permission_id, environment) VALUES (104, '2021-01-01T00:00:00Z', 102, 'dev');
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, created_at, permission_id, environment) VALUES (104, '2021-01-02T00:00:00Z', 102, 'dev');
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, created_at, permission_id, environment) VALUES (104, '2021-01-02T00:00:00Z', 102, 'prod');
        INSERT INTO "dedupe_permissions_test"."role_permission" (role_id, created_at, permission_id, environment) VALUES (104, '2021-01-01T00:00:00Z', 102, 'prod');
    `);

    // Run the dedupe migration
    await dbm.up('20231122121456-dedupe-any-duplicate-permissions.js');

    // Check the results
    const { rows: resultsPermissions } = await client.query(`
        SELECT permission FROM "dedupe_permissions_test"."permissions" ORDER BY id;
    `);

    const { rows: resultsRolePermission } = await client.query(`
        SELECT role_id, permission_id FROM "dedupe_permissions_test"."role_permission" WHERE role_id IN (101, 102, 103) ORDER BY role_id, permission_id;
    `);

    expect(resultsPermissions.length).toEqual(7);
    expect(resultsPermissions).toEqual([
        { permission: 'TEST_PERMISSION_1' },
        { permission: 'TEST_PERMISSION_DUPLICATE_1' },
        { permission: 'TEST_PERMISSION_2' },
        { permission: 'TEST_PERMISSION_3' },
        { permission: 'TEST_PERMISSION_DUPLICATE_2' },
        { permission: 'TEST_PERMISSION_4' },
        { permission: 'TEST_PERMISSION_DUPLICATE_3' },
    ]);

    expect(resultsRolePermission.length).toEqual(14);
    expect(resultsRolePermission).toEqual([
        // Role 101, we set all permissions and expect to see all permissions, where the duplicate permissions have been deduped to the min ID of each duplicate permission
        { role_id: 101, permission_id: 101 },
        { role_id: 101, permission_id: 102 },
        { role_id: 101, permission_id: 104 },
        { role_id: 101, permission_id: 105 },
        { role_id: 101, permission_id: 106 },
        { role_id: 101, permission_id: 108 },
        { role_id: 101, permission_id: 109 },
        // Role 102, we set all duplicate permissions and expect to see the deduped permissions to the min ID of each duplicate permission
        { role_id: 102, permission_id: 102 },
        { role_id: 102, permission_id: 106 },
        { role_id: 102, permission_id: 109 },
        // Role 103, we set all unique permissions and expect to see no changes
        { role_id: 103, permission_id: 101 },
        { role_id: 103, permission_id: 104 },
        { role_id: 103, permission_id: 105 },
        { role_id: 103, permission_id: 108 },
    ]);

    // Test duplicate permission assignments, where role_id, permission_id, and environment are the same, as they should be deduped to the min created_at
    const { rows: resultsDedupedRolePermissionAssignments } =
        await client.query(`
        SELECT role_id, created_at, permission_id, environment FROM "dedupe_permissions_test"."role_permission" WHERE role_id = 104 ORDER BY role_id, permission_id;
    `);

    expect(resultsDedupedRolePermissionAssignments.length).toEqual(2);
    expect(resultsDedupedRolePermissionAssignments).toEqual([
        {
            role_id: 104,
            created_at: new Date('2021-01-01T00:00:00.000Z'),
            permission_id: 102,
            environment: 'dev',
        },
        {
            role_id: 104,
            created_at: new Date('2021-01-01T00:00:00.000Z'),
            permission_id: 102,
            environment: 'prod',
        },
    ]);

    await client.end();
    await dbm.reset();
}, 15000);
