import { getDbConfig } from '../../test/e2e/helpers/database-config';
import { createTestConfig } from '../../test/config/test-config';
import { log } from 'db-migrate-shared';
import { Client } from 'pg';
import type { IDBOption } from '../../lib/types';
import { migrateDb } from '../../migrator';
import { SYSTEM_USER } from './core';

log.setLogLevel('error');

async function initSchema(db: IDBOption): Promise<void> {
    const client = new Client(db);
    await client.connect();
    await client.query(`DROP SCHEMA IF EXISTS ${db.schema} CASCADE`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${db.schema}`);
    await client.end();
}

describe('System user definitions in code and db', () => {
    let dbDefinition: {
        email: string | null;
        username: string;
        name: string;
        id: number;
        image_url: string | null;
    };
    beforeAll(async () => {
        jest.setTimeout(15000);
        const config = createTestConfig({
            db: {
                ...getDbConfig(),
                pool: { min: 1, max: 4 },
                schema: 'system_user_alignment_test',
                ssl: false,
            },
        });

        await initSchema(config.db);

        const e2e = {
            ...config.db,
            connectionTimeoutMillis: 2000,
        };

        await migrateDb(config);

        const client = new Client(config.db);
        await client.connect();

        const query = await client.query(
            `select * from system_user_alignment_test.users where id = -1337;`,
        );

        dbDefinition = query.rows[0];
    });

    test('usernames match', () => {
        expect(SYSTEM_USER.username).toBe(dbDefinition.username);
    });
    test('ids match', () => {
        expect(SYSTEM_USER.id).toBe(dbDefinition.id);
    });
    test('names match', () => {
        expect(SYSTEM_USER.name).toBe(dbDefinition.name);
    });
    test('emails match', () => {
        expect('email' in SYSTEM_USER).toBe(false);
        expect(dbDefinition.email).toBe(null);
    });
    test('image URLs are both falsy', () => {
        expect(Boolean(SYSTEM_USER.imageUrl)).toBe(
            Boolean(dbDefinition.image_url),
        );
    });
    test('isApi is false on variable definition', () => {
        // we don't set this in the DB, so let's just test the
        // definition
        expect(SYSTEM_USER.isAPI).toBe(false);
    });
});
