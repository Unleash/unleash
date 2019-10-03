'use strict';

const test = require('ava');
const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    stores = await dbInit('event_api_serial', getLogger);
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('returns events', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/events')
        .expect('Content-Type', /json/)
        .expect(200);
});

test.serial('returns events given a name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/events/myname')
        .expect('Content-Type', /json/)
        .expect(200);
});
