'use strict';

const test = require('ava');
const { setupApp } = require('./helpers/test-helper');
const dbInit = require('./helpers/database-init');
const getLogger = require('../fixtures/no-logger');

let stores;
let db;

test.before(async () => {
    db = await dbInit('health_api', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await db.destroy();
});

test('returns health good', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect('{"health":"GOOD"}');
});
