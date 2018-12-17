'use strict';

const test = require('ava');
const { setupApp } = require('./../../helpers/test-helper');

test.serial('gets all strategies', async t => {
    t.plan(1);
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .get('/api/admin/strategies')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(
                res.body.strategies.length === 2,
                'expected to have two strategies'
            );
        })
        .then(destroy);
});

test.serial('gets a strategy by name', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .get('/api/admin/strategies/default')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(destroy);
});

test.serial('cant get a strategy by name that dose not exist', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .get('/api/admin/strategies/mystrategy')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(destroy);
});

test.serial('creates a new strategy', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .post('/api/admin/strategies')
        .send({
            name: 'myCustomStrategy',
            description: 'Best strategy ever.',
            parameters: [],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .then(destroy);
});

test.serial('requires new strategies to have a name', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .post('/api/admin/strategies')
        .send({ name: '' })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then(destroy);
});

test.serial('refuses to create a strategy with an existing name', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .post('/api/admin/strategies')
        .send({ name: 'default', parameters: [] })
        .set('Content-Type', 'application/json')
        .expect(403)
        .then(destroy);
});

test.serial('deletes a new strategy', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .delete('/api/admin/strategies/usersWithEmail')
        .expect(200)
        .then(destroy);
});

test.serial("can't delete a strategy that dose not exist", async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('strategy_api_serial', false);
    return request
        .delete('/api/admin/strategies/unknown')
        .expect(404)
        .then(destroy);
});

test.serial('updates a exiting strategy', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .put('/api/admin/strategies/default')
        .send({
            name: 'default',
            description: 'Default is the best!',
            parameters: [],
        })
        .set('Content-Type', 'application/json')
        .expect(200)
        .then(destroy);
});

test.serial('cant update a unknown strategy', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .put('/api/admin/strategies/unknown')
        .send({ name: 'unkown', parameters: [] })
        .set('Content-Type', 'application/json')
        .expect(404)
        .then(destroy);
});
