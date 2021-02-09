'use strict';

const test = require('ava');
const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    const db = await dbInit('archive_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('returns three archived toggles', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/archive/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 3);
        });
});

test.serial('revives a feature by name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/archive/revive/featureArchivedX')
        .set('Content-Type', 'application/json')
        .expect(200);
});

test.serial(
    'archived feature is not accessible via /features/:featureName',
    async t => {
        t.plan(0);
        const request = await setupApp(stores);

        return request
            .get('/api/admin/features/featureArchivedZ')
            .set('Content-Type', 'application/json')
            .expect(404);
    },
);

test.serial('must set name when reviving toggle', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request.post('/api/admin/archive/revive/').expect(404);
});
