import {
    type IUnleashTest,
    setupAppWithBaseUrl,
} from '../helpers/test-helper.js';

import dbInit, { type ITestDb } from '../helpers/database-init.js';

let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('routes_test_serial');
    app = await setupAppWithBaseUrl(db.stores);
});

afterAll(async () => {
    await app.destroy();
    if (db != null) {
        await db.destroy();
    }
});

test('hitting a baseUri path returns HTML document', async () => {
    expect.assertions(0);
    await app.request
        .get('/hosted/projects')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8');
});

test('hitting an api path that does not exist returns 404', async () => {
    expect.assertions(0);
    await app.request.get('/api/i-dont-exist').expect(404);
});

test('hitting an /admin/api returns HTML document', async () => {
    expect.assertions(0);
    await app.request
        .get('/hosted/admin/api')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8');
});

test('hitting a non-api returns HTML document', async () => {
    expect.assertions(0);
    await app.request
        .get('/hosted/i-dont-exist')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8');
});
