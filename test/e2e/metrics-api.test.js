'use strict';
const test = require('ava');
const { setupApp } = require('./util/test-helper');
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

test.serial('should get client instances', async t => {
    const { request, destroy  } = await setupApp('metrics_serial');
    return request
        .get('/api/client/instances')
        .expect('Content-Type', /json/)
        .expect((res) => {
            t.true(res.status === 200);
            t.true(res.body.length === 1);
        })
        .then(destroy);
});

