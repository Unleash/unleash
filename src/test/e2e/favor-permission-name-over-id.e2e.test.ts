import { getDbConfig } from './helpers/database-config';
import { createTestConfig } from '../config/test-config';
import { getInstance } from 'db-migrate';
import { log } from 'db-migrate-shared';
import { Client } from 'pg';
import { IDBOption } from '../../lib/types';

log.setLogLevel('error');

async function initSchema(db: IDBOption): Promise<void> {
    const client = new Client(db);
    await client.connect();
    await client.query(`DROP SCHEMA IF EXISTS ${db.schema} CASCADE`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${db.schema}`);
    await client.end();
}

test('Favor permission name over id migration correctly assigns permissions by name', async () => {
    jest.setTimeout(15000);
    const config = createTestConfig({
        db: {
            ...getDbConfig(),
            pool: { min: 1, max: 4 },
            schema: 'favor_permission_name_over_id_test',
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

    // Run all migrations up to, and including, this one, the last one before the favor permission name over id migration
    await dbm.up('20231123100052-drop-last-seen-foreign-key.js');

    // Set up the test data
    const client = new Client(config.db);
    await client.connect();
    await client.query(`
        DELETE FROM "favor_permission_name_over_id_test"."roles";

        INSERT INTO "favor_permission_name_over_id_test"."roles" (id, name, description, type) VALUES (101, 'Role 1', 'A test role', 'custom');
    `);
    await client.query(`
        DELETE FROM "favor_permission_name_over_id_test"."permissions";

        INSERT INTO "favor_permission_name_over_id_test"."permissions" (id, permission, display_name, type) VALUES (101, 'TEST_PERMISSION_1', 'A test permission', 'root');
        INSERT INTO "favor_permission_name_over_id_test"."permissions" (id, permission, display_name, type) VALUES (102, 'TEST_PERMISSION_2', 'A test permission', 'root');
        INSERT INTO "favor_permission_name_over_id_test"."permissions" (id, permission, display_name, type) VALUES (103, 'TEST_PERMISSION_3', 'A test permission', 'root');
        INSERT INTO "favor_permission_name_over_id_test"."permissions" (id, permission, display_name, type) VALUES (104, 'TEST_PERMISSION_4', 'A test permission', 'root');
    `);
    await client.query(`
        DELETE FROM "favor_permission_name_over_id_test"."role_permission";

        INSERT INTO "favor_permission_name_over_id_test"."role_permission" (role_id, permission_id) VALUES (101, 101);
        INSERT INTO "favor_permission_name_over_id_test"."role_permission" (role_id, permission_id) VALUES (101, 102);
        INSERT INTO "favor_permission_name_over_id_test"."role_permission" (role_id, permission_id) VALUES (101, 103);
        INSERT INTO "favor_permission_name_over_id_test"."role_permission" (role_id, permission_id) VALUES (101, 104);
    `);

    // Run the drop permissions id migration
    await dbm.up('20231123155649-favor-permission-name-over-id.js');

    // Check the results
    const { rows: resultsPermissions } = await client.query(`
        SELECT * FROM "favor_permission_name_over_id_test"."permissions" ORDER BY created_at;
    `);

    const { rows: resultsRolePermission } = await client.query(`
        SELECT * FROM "favor_permission_name_over_id_test"."role_permission" WHERE role_id = 101 ORDER BY created_at;
    `);

    // We keep the id for now, but will remove it in the next major version
    expect('id' in resultsPermissions[0]).toEqual(true);
    expect(
        resultsPermissions.map(({ permission, display_name, type }) => ({
            permission,
            display_name,
            type,
        })),
    ).toMatchSnapshot();

    // We keep the permission_id for now, but will remove it in the next minor version
    expect('permission_id' in resultsRolePermission[0]).toEqual(true);
    expect('permission' in resultsRolePermission[0]).toEqual(true);

    expect(resultsRolePermission.length).toEqual(4);
    expect(
        resultsRolePermission.map(({ role_id, permission }) => ({
            role_id,
            permission,
        })),
    ).toEqual([
        { role_id: 101, permission: 'TEST_PERMISSION_1' },
        { role_id: 101, permission: 'TEST_PERMISSION_2' },
        { role_id: 101, permission: 'TEST_PERMISSION_3' },
        { role_id: 101, permission: 'TEST_PERMISSION_4' },
    ]);

    // Check the results that ensure the default roles exist and have the correct permissions
    const { rows: resultsRoles } = await client.query(`
        SELECT name, description, type FROM "favor_permission_name_over_id_test"."roles" WHERE id != 101 ORDER BY created_at;
    `);

    const { rows: resultsDefaultRolePermissions } = await client.query(`
        SELECT role_id, environment, permission FROM "favor_permission_name_over_id_test"."role_permission" WHERE role_id != 101 ORDER BY created_at;
    `);

    expect(resultsRoles.length).toEqual(5);
    expect(resultsRoles).toEqual([
        {
            name: 'Admin',
            description:
                'Users with the root admin role have superuser access to Unleash and can perform any operation within the Unleash platform.',
            type: 'root',
        },
        {
            name: 'Editor',
            description:
                'Users with the root editor role have access to most features in Unleash, but can not manage users and roles in the root scope. Editors will be added as project owners when creating projects and get superuser rights within the context of these projects. Users with the editor role will also get access to most permissions on the default project by default.',
            type: 'root',
        },
        {
            name: 'Viewer',
            description:
                'Users with the root viewer role can only read root resources in Unleash. Viewers can be added to specific projects as project members. Users with the viewer role may not view API tokens.',
            type: 'root',
        },
        {
            name: 'Owner',
            description:
                'Users with the project owner role have full control over the project, and can add and manage other users within the project context, manage feature toggles within the project, and control advanced project features like archiving and deleting the project.',
            type: 'project',
        },
        {
            name: 'Member',
            description:
                "Users with the project member role are allowed to view, create, and update feature toggles within a project, but have limited permissions in regards to managing the project's user access and can not archive or delete the project.",
            type: 'project',
        },
    ]);

    expect(resultsDefaultRolePermissions).toMatchSnapshot();

    await client.end();
    await dbm.reset();
});
