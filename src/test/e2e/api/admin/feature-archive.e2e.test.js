'use strict';

const test = require('ava');
const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

test.before(async () => {
    db = await dbInit('archive_serial', getLogger);
    stores = db.stores;
});

test.after.always(async () => {
    await db.destroy();
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

test.serial('should be allowed to reuse deleted toggle name', async t => {
    t.plan(3);
    const request = await setupApp(stores);
    await request
        .post('/api/admin/features')
        .send({
            name: 'really.delete.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            t.is(res.body.name, 'really.delete.feature');
            t.is(res.body.enabled, false);
            t.truthy(res.body.createdAt);
        });
    await request
        .delete(`/api/admin/features/really.delete.feature`)
        .expect(200);
    await request
        .delete(`/api/admin/archive/really.delete.feature`)
        .expect(200);
    return request
        .post(`/api/admin/features/validate`)
        .send({ name: 'really.delete.feature' })
        .set('Content-Type', 'application/json')
        .expect(200);
});
test.serial('Deleting an unarchived toggle should not take effect', async t => {
    t.plan(3);
    const request = await setupApp(stores);
    await request
        .post('/api/admin/features')
        .send({
            name: 'really.delete.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            t.is(res.body.name, 'really.delete.feature');
            t.is(res.body.enabled, false);
            t.truthy(res.body.createdAt);
        });
    await request
        .delete(`/api/admin/archive/really.delete.feature`)
        .expect(200);
    return request
        .post(`/api/admin/features/validate`)
        .send({ name: 'really.delete.feature' })
        .set('Content-Type', 'application/json')
        .expect(409); // because it still exists
});
