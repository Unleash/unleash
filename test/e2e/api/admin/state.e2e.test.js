'use strict';

const test = require('ava');
const { setupApp } = require('./../../helpers/test-helper');
const importData = require('../../../examples/import.json');

test.serial('exports strategies and features as json by default', async t => {
    t.plan(2);
    const { request, destroy } = await setupApp('state_api_serial');
    return request
        .get('/api/admin/state/export')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true('features' in res.body);
            t.true('strategies' in res.body);
        })
        .then(destroy);
});

test.serial('exports strategies and features as yaml', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('state_api_serial');
    return request
        .get('/api/admin/state/export?format=yaml')
        .expect('Content-Type', /yaml/)
        .expect(200)
        .then(destroy);
});

test.serial('exports strategies and features as attachment', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('state_api_serial');
    return request
        .get('/api/admin/state/export?download=1')
        .expect('Content-Type', /json/)
        .expect('Content-Disposition', /attachment/)
        .expect(200)
        .then(destroy);
});

test.serial('imports strategies and features', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('state_api_serial');
    return request
        .post('/api/admin/state/import')
        .send(importData)
        .expect(202)
        .then(destroy);
});

test.serial('does not not accept gibberish', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('state_api_serial');
    return request
        .post('/api/admin/state/import')
        .send({ features: 'nonsense' })
        .expect(400)
        .then(destroy);
});

test.serial('imports strategies and features from json file', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('state_api_serial');
    return request
        .post('/api/admin/state/import')
        .attach('file', 'test/examples/import.json')
        .expect(202)
        .then(destroy);
});

test.serial('imports strategies and features from yaml file', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('state_api_serial');
    return request
        .post('/api/admin/state/import')
        .attach('file', 'test/examples/import.yml')
        .expect(202)
        .then(destroy);
});
