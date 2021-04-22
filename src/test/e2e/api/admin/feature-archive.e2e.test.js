'use strict';;
const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('archive_serial', getLogger);
    stores = db.stores;
});

test(async () => {
    await db.destroy();
});

test('returns three archived toggles', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/archive/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length === 3).toBe(true);
        });
});

test('revives a feature by name', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/archive/revive/featureArchivedX')
        .set('Content-Type', 'application/json')
        .expect(200);
});

test(
    'archived feature is not accessible via /features/:featureName',
    async () => {
        expect.assertions(0);
        const request = await setupApp(stores);

        return request
            .get('/api/admin/features/featureArchivedZ')
            .set('Content-Type', 'application/json')
            .expect(404);
    }
);

test('must set name when reviving toggle', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request.post('/api/admin/archive/revive/').expect(404);
});
