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
