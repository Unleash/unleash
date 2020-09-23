'use strict';

const test = require('ava');
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let reset = () => {};

test.before(async () => {
    const db = await dbInit('metrics_serial', getLogger);
    stores = db.stores;
    reset = db.reset;
});

test.after(async () => {
    await stores.db.destroy();
});

test.afterEach(async () => {
    await reset();
});

test.serial('should get application details', async t => {
    t.plan(3);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/metrics/applications/demo-app-1')
        .expect('Content-Type', /json/)
        .expect(res => {
            t.true(res.status === 200);
            t.true(res.body.appName === 'demo-app-1');
            t.true(res.body.instances.length === 1);
        });
});

test.serial('should get list of applications', async t => {
    t.plan(2);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(res => {
            t.true(res.status === 200);
            t.is(res.body.applications.length, 3);
        });
});

test.serial('should delee application', async t => {
    t.plan(2);
    const request = await setupApp(stores);
    await request
        .delete('/api/admin/metrics/applications/deletable-app')
        .expect(res => {
            t.true(res.status === 200);
        });
    return request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(res => {
            t.is(res.body.applications.length, 2);
        });
});
