'use strict';

const test = require('ava');
const importData = require('../../../examples/import.json');
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

test.before(async () => {
    db = await dbInit('state_api_serial', getLogger);
    stores = db.stores;
});

test.after.always(async () => {
    await db.destroy();
});

test.serial('exports strategies and features as json by default', async t => {
    t.plan(2);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/state/export')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true('features' in res.body);
            t.true('strategies' in res.body);
        });
});

test.serial('exports strategies and features as yaml', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/state/export?format=yaml')
        .expect('Content-Type', /yaml/)
        .expect(200);
});

test.serial('exports only features as yaml', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/state/export?format=yaml&featureToggles=1')
        .expect('Content-Type', /yaml/)
        .expect(200);
});

test.serial('exports strategies and features as attachment', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/state/export?download=1')
        .expect('Content-Type', /json/)
        .expect('Content-Disposition', /attachment/)
        .expect(200);
});

test.serial('imports strategies and features', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/state/import')
        .send(importData)
        .expect(202);
});

test.serial('does not not accept gibberish', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/state/import')
        .send({ features: 'nonsense' })
        .expect(400);
});

test.serial('imports strategies and features from json file', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/state/import')
        .attach('file', 'src/test/examples/import.json')
        .expect(202);
});

test.serial('imports strategies and features from yaml file', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/state/import')
        .attach('file', 'src/test/examples/import.yml')
        .expect(202);
});
