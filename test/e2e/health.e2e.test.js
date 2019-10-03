'use strict';

const test = require('ava');
const { setupApp } = require('./helpers/test-helper');
const dbInit = require('./helpers/database-init');
const getLogger = require('../fixtures/no-logger');

let stores;

test.before(async () => {
    stores = await dbInit('health_api', getLogger);
});

test.after(async () => {
    await stores.db.destroy();
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
