import { setupAppWithCustomConfig } from './helpers/test-helper.js';
import dbInit, { type ITestDb } from './helpers/database-init.js';

let db: ITestDb;

describe('DB is up', () => {
    beforeAll(async () => {
        db = await dbInit();
    });

    test('when checkDb is disabled, returns ready', async () => {
        const { request } = await setupAppWithCustomConfig(
            db.stores,
            undefined,
            db.rawDatabase,
        );
        await request
            .get('/ready')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('{"health":"GOOD"}');
    });

    test('when checkDb is enabled, returns ready', async () => {
        const { request } = await setupAppWithCustomConfig(
            db.stores,
            { checkDbOnReady: true },
            db.rawDatabase,
        );
        await request.get('/ready').expect(200).expect('{"health":"GOOD"}');
    });

    test('fails fast when readiness query hangs', async () => {
        const { request } = await setupAppWithCustomConfig(
            db.stores,
            { checkDbOnReady: true },
            db.rawDatabase,
        );

        const pool = db.rawDatabase.client.pool;
        const originalAcquire = pool.acquire.bind(pool);

        pool.acquire = () => {
            const pending = originalAcquire();
            pending.promise = pending.promise.then((conn: any) => {
                const originalQuery = conn.query;
                conn.query = (queryConfig: any, ...args: any[]) => {
                    const isSelectOne =
                        queryConfig?.toUpperCase() === 'SELECT 1';

                    if (isSelectOne) {
                        return originalQuery.call(
                            conn,
                            'SELECT pg_sleep(1)',
                            ...args,
                        );
                    }

                    return originalQuery.call(conn, queryConfig, ...args);
                };
                return conn;
            });
            return pending;
        };

        try {
            await request.get('/ready').expect(503);
        } finally {
            pool.acquire = originalAcquire;
        }
    });
});

describe('DB is down', () => {
    beforeAll(async () => {
        db = await dbInit();
    });

    test('when checkDb is disabled, returns readiness good', async () => {
        const { request } = await setupAppWithCustomConfig(
            db.stores,
            undefined,
            db.rawDatabase,
        );
        await db.destroy();
        await request
            .get('/ready')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('{"health":"GOOD"}');
    });

    test('when checkDb is enabled, fails readiness check', async () => {
        const { request } = await setupAppWithCustomConfig(
            db.stores,
            { checkDbOnReady: true },
            db.rawDatabase,
        );
        await db.destroy();
        await request.get('/ready').expect(503);
    });
});
