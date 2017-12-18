'use strict';

const { test } = require('ava');

const { setupApp } = require('./../../helpers/test-helper');
const metricsExample = require('../../../examples/client-metrics.json');

test.serial('should be possble to send metrics', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('metrics_api_client');
    return request
        .post('/api/client/metrics')
        .send(metricsExample)
        .expect(202)
        .then(destroy);
});

test.serial('should require valid send metrics', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('metrics_api_client');
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'test',
        })
        .expect(400)
        .then(destroy);
});
