'use strict';

const test = require('ava');
const { setupApp } = require('./helpers/test-helper');
const logger = require('../../lib/logger');

test.beforeEach(() =>  {
    logger.setLevel('FATAL');
});

test.serial('gets all strategies', async (t) => {
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .get('/api/strategies')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(destroy);
});

test.serial('gets a strategy by name', async (t) => {
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .get('/api/strategies/default')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(destroy);
});

test.serial('cant get a strategy by name that dose not exist', async (t) => {
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .get('/api/strategies/mystrategy')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(destroy);
});

test.serial('creates a new strategy', async (t) => {
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .post('/api/strategies')
        .send({ name: 'myCustomStrategy', description: 'Best strategy ever.' })
        .set('Content-Type', 'application/json')
        .expect(201)
        .then(destroy);
});

test.serial('requires new strategies to have a name', async (t) => {
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .post('/api/strategies')
        .send({ name: '' })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then(destroy);
});

test.serial('refuses to create a strategy with an existing name', async (t) => {
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .post('/api/strategies')
        .send({ name: 'default' })
        .set('Content-Type', 'application/json')
        .expect(403)
        .then(destroy);
});

test.serial('deletes a new strategy', async (t) => {
    const { request, destroy } = await setupApp('strategy_api_serial');
    return request
        .delete('/api/strategies/usersWithEmail')
        .expect(200)
        .then(destroy);
});

test.serial('can\'t delete a strategy that dose not exist', async (t) => {
    const { request, destroy } = await setupApp('strategy_api_serial', false);
    return request
        .delete('/api/strategies/unknown')
        .expect(404);
});
