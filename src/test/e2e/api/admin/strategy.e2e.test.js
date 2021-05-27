'use strict';

const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let app;
let db;

beforeAll(async () => {
    db = await dbInit('strategy_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('gets all strategies', async () => {
    expect.assertions(1);

    return app.request
        .get('/api/admin/strategies')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.strategies.length === 2).toBe(true);
        });
});

test('gets a strategy by name', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/admin/strategies/default')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('cant get a strategy by name that does not exist', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/admin/strategies/mystrategy')
        .expect('Content-Type', /json/)
        .expect(404);
});

test('creates a new strategy', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/strategies')
        .send({
            name: 'myCustomStrategy',
            description: 'Best strategy ever.',
            parameters: [],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('requires new strategies to have a name', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/strategies')
        .send({ name: '' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('refuses to create a strategy with an existing name', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/strategies')
        .send({ name: 'default', parameters: [] })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('deletes a new strategy', async () => {
    expect.assertions(0);

    return app.request
        .delete('/api/admin/strategies/usersWithEmail')
        .expect(200);
});

test("can't delete a strategy that dose not exist", async () => {
    expect.assertions(0);

    return app.request.delete('/api/admin/strategies/unknown').expect(404);
});

test('updates a exiting strategy', async () => {
    expect.assertions(0);

    return app.request
        .put('/api/admin/strategies/default')
        .send({
            name: 'default',
            description: 'Default is the best!',
            parameters: [],
        })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('cant update a unknown strategy', async () => {
    expect.assertions(0);

    return app.request
        .put('/api/admin/strategies/unknown')
        .send({ name: 'unkown', parameters: [] })
        .set('Content-Type', 'application/json')
        .expect(404);
});

test('deprecating a strategy works', async () => {
    const name = 'deprecate';
    await app.request
        .post('/api/admin/strategies')
        .send({ name, description: 'Should deprecate this', parameters: [] })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post(`/api/admin/strategies/${name}/deprecate`)
        .set('Content-Type', 'application/json')
        .send()
        .expect(200);
    await app.request
        .get(`/api/admin/strategies/${name}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => expect(res.body.deprecated).toBe(true));
});

test('can reactivate a deprecated strategy', async () => {
    const name = 'reactivate';
    await app.request
        .post('/api/admin/strategies')
        .send({ name, description: 'Should deprecate this', parameters: [] })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post(`/api/admin/strategies/${name}/deprecate`)
        .set('Content-Type', 'application/json')
        .send()
        .expect(200);
    await app.request
        .get(`/api/admin/strategies/${name}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => expect(res.body.deprecated).toBe(true));
    await app.request
        .post(`/api/admin/strategies/${name}/reactivate`)
        .set('Content-Type', 'application/json')
        .send()
        .expect(200);
    await app.request
        .get(`/api/admin/strategies/${name}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => expect(res.body.deprecated).toBe(false));
});

test('cannot deprecate default strategy', async () => {
    expect.assertions(0);

    await app.request
        .post('/api/admin/strategies/default/deprecate')
        .set('Content-Type', 'application/json')
        .expect(403);
});

test('can update a exiting strategy with deprecated', async () => {
    expect.assertions(0);

    await app.request
        .post('/api/admin/strategies')
        .send({
            name: 'myCustomStrategyDepreacted',
            description: 'Best strategy ever.',
            parameters: [],
            deprecated: true,
        })
        .set('Content-Type', 'application/json');

    const { body: strategy } = await app.request.get(
        '/api/admin/strategies/myCustomStrategyDepreacted',
    );

    strategy.description = 'A new desc';

    return app.request
        .put('/api/admin/strategies/default')
        .send(strategy)
        .set('Content-Type', 'application/json')
        .expect(200);
});
