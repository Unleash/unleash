import { getDbConfig } from './helpers/database-config';
import { createTestConfig } from '../config/test-config';
import { getInstance } from 'db-migrate';
import { Client } from 'pg';

async function initSchema(db) {
    const client = new Client(db);
    await client.connect();
    await client.query(`DROP SCHEMA IF EXISTS ${db.schema} CASCADE`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${db.schema}`);
    await client.end();
}

async function insertEvents(client, events) {
    const values = events
        .map(
            (e) =>
                `('${e.type}', '${JSON.stringify(e.data || {})}', '${JSON.stringify(
                    e.pre_data || {},
                )}', '${e.created_at}', '${e.created_by}')`,
        )
        .join(',');

    await client.query(`
        INSERT INTO events (type, data, pre_data, created_at, created_by)
        VALUES ${values};
    `);
}

describe('licensed_users backfill', () => {
    jest.setTimeout(15000);

    let client: any;
    let dbm: any;
    const config = createTestConfig({
        db: {
            ...getDbConfig(),
            pool: { min: 1, max: 4 },
            schema: 'licensed_users_test',
            ssl: false,
        },
    });

    beforeAll(async () => {
        await initSchema(config.db);

        dbm = getInstance(true, {
            cwd: `${__dirname}/../../`,
            config: { e2e: { ...config.db, connectionTimeoutMillis: 2000 } },
            env: 'e2e',
        });

        await dbm.up('20241114103646-licensed-users.js');
        client = new Client(config.db);
        await client.connect();
        await client.query(`SET search_path = 'licensed_users_test';`);
    });

    afterAll(async () => {
        await client.end();
        await dbm.reset();
    });

    beforeEach(async () => {
        await client.query('delete from events;');
        await client.query('delete from licensed_users;');
        await client.query(
            "DELETE FROM migrations WHERE name = '/20241119105837-licensed-users-backfill';",
        );
    });

    test('Counts users from their creation date until their deletion date and 30 days', async () => {
        await insertEvents(client, [
            {
                type: 'user-created',
                data: { email: 'user1@test.com' },
                created_at: '2024-10-01',
                created_by: 'test',
            },
            {
                type: 'user-deleted',
                pre_data: { email: 'user1@test.com' },
                created_at: '2024-10-05',
                created_by: 'test',
            },
        ]);

        await dbm.up('20241119105837-licensed-users-backfill.js');

        const { rows } = await client.query(
            "SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date, count FROM licensed_users ORDER BY date;",
        );
        expect(rows.find((row) => row.date === '2024-10-01').count).toBe(1);
        expect(rows.find((row) => row.date === '2024-10-02').count).toBe(1);
        expect(rows.find((row) => row.date === '2024-10-05').count).toBe(1);
        expect(rows.find((row) => row.date === '2024-11-04').count).toBe(1);
        expect(rows.find((row) => row.date === '2024-11-05').count).toBe(0); // 30 days has passed
    });

    test('Counts multiple users correctly over their active periods, including 30-day retention from deletion', async () => {
        await insertEvents(client, [
            {
                type: 'user-created',
                data: { email: 'user1@test.com' },
                created_at: '2024-09-01',
                created_by: 'test',
            },
            {
                type: 'user-created',
                data: { email: 'user2@test.com' },
                created_at: '2024-10-01',
                created_by: 'test',
            },
            {
                type: 'user-deleted',
                pre_data: { email: 'user1@test.com' },
                created_at: '2024-10-05',
                created_by: 'test',
            },
        ]);

        await dbm.up('20241119105837-licensed-users-backfill.js');

        const { rows } = await client.query(
            "SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date, count FROM licensed_users ORDER BY date;",
        );
        expect(rows.find((row) => row.date === '2024-09-01').count).toBe(1); // user1 created
        expect(rows.find((row) => row.date === '2024-10-01').count).toBe(2); // user1 active, user2 created
        expect(rows.find((row) => row.date === '2024-10-05').count).toBe(2); // user1 within retention, user2 active
        expect(rows.find((row) => row.date === '2024-11-19').count).toBe(1); // Only user2 active, user1's retention has ended
    });

    test('Handles users created but not deleted', async () => {
        await insertEvents(client, [
            {
                type: 'user-created',
                data: { email: 'user1@test.com' },
                created_at: '2024-11-01',
                created_by: 'test',
            },
        ]);

        await dbm.up('20241119105837-licensed-users-backfill.js');

        const { rows } = await client.query(
            "SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date, count FROM licensed_users ORDER BY date;",
        );
        expect(rows.find((row) => row.date === '2024-11-01').count).toBe(1); // user1 created
        expect(rows.find((row) => row.date === '2024-11-19').count).toBe(1); // user1 still active
    });

    test('Handles overlapping creation and deletion periods with multiple events for the same email (one month earlier)', async () => {
        await insertEvents(client, [
            {
                type: 'user-created',
                data: { email: 'user1@test.com' },
                created_at: '2024-10-01 00:00:00+00',
                created_by: 'test',
            },
            {
                type: 'user-deleted',
                pre_data: { email: 'user1@test.com' },
                created_at: '2024-10-01 00:01:00+00',
                created_by: 'test',
            },
            {
                type: 'user-created',
                data: { email: 'user1@test.com' },
                created_at: '2024-10-03',
                created_by: 'test',
            },
            {
                type: 'user-deleted',
                pre_data: { email: 'user1@test.com' },
                created_at: '2024-10-07',
                created_by: 'test',
            },
            {
                type: 'user-created',
                data: { email: 'user2@test.com' },
                created_at: '2024-10-05',
                created_by: 'test',
            },
            {
                type: 'user-deleted',
                pre_data: { email: 'user2@test.com' },
                created_at: '2024-10-10',
                created_by: 'test',
            },
        ]);

        await dbm.up('20241119105837-licensed-users-backfill.js');

        const { rows } = await client.query(
            "SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date, count FROM licensed_users ORDER BY date;",
        );
        expect(rows.find((row) => row.date === '2024-10-01').count).toBe(1); // user1 created and deleted on the same day
        expect(rows.find((row) => row.date === '2024-10-03').count).toBe(1); // user1 re-created
        expect(rows.find((row) => row.date === '2024-10-05').count).toBe(2); // user1 within retention, user2 created
        expect(rows.find((row) => row.date === '2024-10-07').count).toBe(2); // user1 within retention, user2 active
        expect(rows.find((row) => row.date === '2024-11-07').count).toBe(1); // user2 within retention, user1 expired
        expect(rows.find((row) => row.date === '2024-11-10').count).toBe(0); // Both users expired
    });
});
