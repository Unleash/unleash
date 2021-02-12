'use strict';

const test = require('ava');

const { setupApp } = require('../../helpers/test-helper');
const metricsExample = require('../../../examples/client-metrics.json');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    const db = await dbInit('metrics_api_client', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('should be possble to send metrics', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/client/metrics')
        .send(metricsExample)
        .expect(202);
});

test.serial('should require valid send metrics', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'test',
        })
        .expect(400);
});

test.serial('should register client', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(202);
});

test.serial('should allow client to register multiple times', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    const clientRegistration = {
        appName: 'multipleRegistration',
        instanceId: 'test',
        strategies: ['default', 'another'],
        started: Date.now(),
        interval: 10,
    };

    return request
        .post('/api/client/register')
        .send(clientRegistration)
        .expect(202)
        .then(() =>
            request
                .post('/api/client/register')
                .send(clientRegistration)
                .expect(202),
        );
});

test.serial('should accept client metrics', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {},
            },
        })
        .expect(202);
});
