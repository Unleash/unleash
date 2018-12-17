'use strict';

const test = require('ava');
const { setupApp } = require('./../../helpers/test-helper');

test.serial('returns three feature toggles', async t => {
    const { request, destroy } = await setupApp('feature_api_client');
    return request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 3);
        })
        .then(destroy);
});

test.serial('gets a feature by name', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('feature_api_client');
    return request
        .get('/api/client/features/featureX')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(destroy);
});

test.serial('cant get feature that dose not exist', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('feature_api_client');
    return request
        .get('/api/client/features/myfeature')
        .expect('Content-Type', /json/)
        .expect(404)
        .then(destroy);
});
