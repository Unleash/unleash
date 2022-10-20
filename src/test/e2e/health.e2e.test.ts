import { setupApp } from './helpers/test-helper';
import dbInit from './helpers/database-init';
import getLogger from '../fixtures/no-logger';

let db;

beforeAll(async () => {
    db = await dbInit('health_api', getLogger);
});

afterAll(async () => {
    await db.destroy();
});

test('returns health good', async () => {
    expect.assertions(0);
    const { request, destroy } = await setupApp(db);
    await request
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect('{"health":"GOOD"}');
    await destroy();
});
