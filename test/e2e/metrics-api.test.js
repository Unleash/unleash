'use strict';
const test = require('ava');
const { setupApp } = require('./helpers/test-helper');
const logger = require('../../lib/logger');

test.beforeEach(() =>  {
    logger.setLevel('FATAL');
});

test.serial('should register client', async (t) => {
    const { request, destroy  } = await setupApp('metrics_serial');
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            strategies: ['default'],
            started: Date.now(),
            interval: 10
        })
        .expect(202)
        .then(destroy);
});

test.serial('should allow client to register multiple times', async (t) => {
    const { request, destroy  } = await setupApp('metrics_serial');
    const clientRegistration = {
            appName: 'multipleRegistration',
            instanceId: 'test',
            strategies: ['default', 'another'],
            started: Date.now(),
            interval: 10
    };

    return request
        .post('/api/client/register')
        .send(clientRegistration)
        .expect(202)
        .then(() => request
            .post('/api/client/register')
            .send(clientRegistration)
            .expect(202))
        .then(destroy);
});

test.serial('should accept client metrics', async t => {
    const { request, destroy  } = await setupApp('metrics_serial');
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {}
            }
        })
        .expect(202)
        .then(destroy);
});

test.serial('should get client strategies', async t => {
    const { request, destroy  } = await setupApp('metrics_serial');
    return request
        .get('/api/client/strategies')
        .expect('Content-Type', /json/)
        .expect((res) => {
            t.true(res.status === 200);
            t.true(res.body.length === 1);
        })
        .then(destroy);
});

test.serial('should get application details', async t => {
    const { request, destroy  } = await setupApp('metrics_serial');
    return request
        .get('/api/client/applications/demo-seed')
        .expect('Content-Type', /json/)
        .expect((res) => {
            t.true(res.status === 200);
            t.true(res.body.appName === 'demo-seed');
            t.true(res.body.instances.length === 1);
        })
        .then(destroy);
});

test.serial('should get list of applications', async t => {
    const { request, destroy  } = await setupApp('metrics_serial');
    return request
        .get('/api/client/applications')
        .expect('Content-Type', /json/)
        .expect((res) => {
            t.true(res.status === 200);
            t.true(res.body.applications.length === 2);
        })
        .then(destroy);
});
