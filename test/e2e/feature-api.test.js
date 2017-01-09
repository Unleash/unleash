'use strict';

const { test } = require('ava');
const { setupApp } = require('./helpers/test-helper');
const logger = require('../../lib/logger');

test.beforeEach(() =>  {
    logger.setLevel('FATAL');
});

test.serial('returns three feature toggles', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    return request
        .get('/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            t.true(res.body.features.length === 3);
        })
        .then(destroy);
});

test.serial('gets a feature by name', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    return request
        .get('/features/featureX')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(destroy);
});

test.serial('cant get feature that dose not exist', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    logger.setLevel('FATAL');
    return request
        .get('/features/myfeature')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(destroy);
});

test.serial('creates new feature toggle', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    return request
        .post('/features')
        .send({ name: 'com.test.feature', enabled: false, strategies: [{name: 'default'}] })
        .set('Content-Type', 'application/json')
        .expect(201)
        .then(destroy);
});

test.serial('creates new feature toggle with createdBy', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    logger.setLevel('FATAL');
    request
        .post('/features')
        .send({ name: 'com.test.Username', enabled: false, strategies: [{name: 'default'}]  })
        .set('Cookie', ['username=ivaosthu'])
        .set('Content-Type', 'application/json')
        .end(() => {
            return request
                .get('/api/events')
                .expect((res) => {
                    t.true(res.body.events[0].createdBy === 'ivaosthu');
                })
                .then(destroy);
        });
});

test.serial('require new feature toggle to have a name', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    logger.setLevel('FATAL');
    return request
        .post('/features')
        .send({ name: '' })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then(destroy);
});

test.serial('can not change status of feature toggle that does not exist', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    logger.setLevel('FATAL');
    return request
        .put('/features/should-not-exist')
        .send({ name: 'should-not-exist', enabled: false })
        .set('Content-Type', 'application/json')
        .expect(404).then(destroy);
});

test.serial('can change status of feature toggle that does exist', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    logger.setLevel('FATAL');
    return request
        .put('/features/featureY')
        .send({ name: 'featureY', enabled: true, strategies: [{name: 'default'}] })
        .set('Content-Type', 'application/json')
        .expect(200).then(destroy);
});

test.serial('can not toggle of feature that does not exist', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    logger.setLevel('FATAL');
    return request
        .post('/features/should-not-exist/toggle')
        .set('Content-Type', 'application/json')
        .expect(404).then(destroy);
});

test.serial('can toggle a feature that does exist', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    logger.setLevel('FATAL');
    return request
        .post('/features/featureY/toggle')
        .set('Content-Type', 'application/json')
        .expect(200).then(destroy);
});

test.serial('archives a feature by name', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    return request
        .delete('/features/featureX')
        .expect(200).then(destroy);
});

test.serial('can not archive unknown feature', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    return request
        .delete('/features/featureUnknown')
        .expect(404).then(destroy);
});

test.serial('refuses to create a feature with an existing name', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    return request
        .post('/features')
        .send({ name: 'featureX' })
        .set('Content-Type', 'application/json')
        .expect(403).then(destroy);
});

test.serial('refuses to validate a feature with an existing name', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    return request
        .post('/features-validate')
        .send({ name: 'featureX' })
        .set('Content-Type', 'application/json')
        .expect(403).then(destroy);
});


test.serial('new strategies api automatically map existing strategy to strategies array', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    t.plan(3);
    return request
        .get('/features/featureY')
        .expect('Content-Type', /json/)
        .expect((res) => {
            t.true(res.body.strategies.length === 1, 'expected strategy added to strategies');
            t.true(res.body.strategy === res.body.strategies[0].name);
            t.deepEqual(res.body.parameters, res.body.strategies[0].parameters);
        })
        .then(destroy);
});

test.serial('new strategies api can add two strategies to a feature toggle', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    return request
        .put('/features/featureY')
        .send({
            name: 'featureY',
            description: 'soon to be the #14 feature',
            enabled: false,
            strategies: [
                {
                    name: 'baz',
                    parameters: { foo: 'bar' },
                },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(200)
        .then(destroy);
});

test.serial('new strategies api should not be allowed to post both strategy and strategies', async t => {
    const { request, destroy } = await setupApp('feature_api_serial');
    logger.setLevel('FATAL');
    return request
        .post('/features')
        .send({
            name: 'featureConfusing',
            description: 'soon to be the #14 feature',
            enabled: false,
            strategy: 'baz',
            parameters: {},
            strategies: [
                {
                    name: 'baz',
                    parameters: { foo: 'bar' },
                },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then(destroy);
});

