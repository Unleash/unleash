'use strict';

const test = require('ava');

const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    stores = await dbInit('strategy_api_serial', getLogger);
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('gets all strategies', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/strategies')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(
                res.body.strategies.length === 2,
                'expected to have two strategies'
            );
        });
});

test.serial('gets a strategy by name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/strategies/default')
        .expect('Content-Type', /json/)
        .expect(200);
});

test.serial('cant get a strategy by name that dose not exist', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/strategies/mystrategy')
        .expect('Content-Type', /json/)
        .expect(404);
});

test.serial('creates a new strategy', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/strategies')
        .send({
            name: 'myCustomStrategy',
            description: 'Best strategy ever.',
            parameters: [],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test.serial('requires new strategies to have a name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/strategies')
        .send({ name: '' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial('refuses to create a strategy with an existing name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/strategies')
        .send({ name: 'default', parameters: [] })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial('deletes a new strategy', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request.delete('/api/admin/strategies/usersWithEmail').expect(200);
});

test.serial("can't delete a strategy that dose not exist", async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request.delete('/api/admin/strategies/unknown').expect(404);
});

test.serial('updates a exiting strategy', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .put('/api/admin/strategies/default')
        .send({
            name: 'default',
            description: 'Default is the best!',
            parameters: [],
        })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test.serial('cant update a unknown strategy', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .put('/api/admin/strategies/unknown')
        .send({ name: 'unkown', parameters: [] })
        .set('Content-Type', 'application/json')
        .expect(404);
});
