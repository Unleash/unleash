'use strict';;
const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('event_api_serial', getLogger);
    stores = db.stores;
});

test(async () => {
    await db.destroy();
});

test('returns events', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/events')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('returns events given a name', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/events/myname')
        .expect('Content-Type', /json/)
        .expect(200);
});
