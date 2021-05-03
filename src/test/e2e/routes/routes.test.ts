import test, { before } from 'ava';
import { setupAppWithBaseUrl } from '../helpers/test-helper';

import dbInit from '../helpers/database-init';

let db;
let stores;

before(async () => {
    db = await dbInit('custom_auth_serial');
    stores = db.stores;
});

test.after.always(async () => {
    await db.destroy();
});

test('hitting a baseUri path returns HTML document', async t => {
    t.plan(0);
    const request = await setupAppWithBaseUrl(stores);
    await request
        .get('/hosted')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8');
});

test('hitting an api path that does not exist returns 404', async t => {
    t.plan(0);
    const request = await setupAppWithBaseUrl(stores);
    await request.get('/hosted/api/i-dont-exist').expect(404);
});

test('hitting a non-api returns HTML document', async t => {
    t.plan(0);
    const request = await setupAppWithBaseUrl(stores);
    await request
        .get('/hosted/i-dont-exist')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8');
});
