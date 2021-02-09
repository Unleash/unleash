'use strict';

const test = require('ava');

const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    const db = await dbInit('strategy_api_serial', getLogger);
    stores = db.stores;
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
                'expected to have two strategies',
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
        .expect(409);
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

test.serial('deprecating a strategy works', async t => {
    const request = await setupApp(stores);
    const name = 'deprecate';
    await request
        .post('/api/admin/strategies')
        .send({ name, description: 'Should deprecate this', parameters: [] })
        .set('Content-Type', 'application/json')
        .expect(201);
    await request
        .post(`/api/admin/strategies/${name}/deprecate`)
        .send()
        .expect(200);
    await request
        .get(`/api/admin/strategies/${name}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => t.is(res.body.deprecated, true));
});

test.serial('can reactivate a deprecated strategy', async t => {
    const request = await setupApp(stores);
    const name = 'reactivate';
    await request
        .post('/api/admin/strategies')
        .send({ name, description: 'Should deprecate this', parameters: [] })
        .set('Content-Type', 'application/json')
        .expect(201);
    await request
        .post(`/api/admin/strategies/${name}/deprecate`)
        .send()
        .expect(200);
    await request
        .get(`/api/admin/strategies/${name}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => t.is(res.body.deprecated, true));
    await request
        .post(`/api/admin/strategies/${name}/reactivate`)
        .send()
        .expect(200);
    await request
        .get(`/api/admin/strategies/${name}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => t.is(res.body.deprecated, false));
});

test.serial('cannot deprecate default strategy', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    await request.post('/api/admin/strategies/default/deprecate').expect(403);
});

test.serial('can update a exiting strategy with deprecated', async t => {
    t.plan(0);
    const request = await setupApp(stores);

    await request
        .post('/api/admin/strategies')
        .send({
            name: 'myCustomStrategyDepreacted',
            description: 'Best strategy ever.',
            parameters: [],
            deprecated: true,
        })
        .set('Content-Type', 'application/json');

    const { body: strategy } = await request.get(
        '/api/admin/strategies/myCustomStrategyDepreacted',
    );

    strategy.description = 'A new desc';

    return request
        .put('/api/admin/strategies/default')
        .send(strategy)
        .set('Content-Type', 'application/json')
        .expect(200);
});
