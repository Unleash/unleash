'use strict';

const test = require('ava');
const { setupApp } = require('./helpers/test-helper');

test('returns health good', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('health');
    return request
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect('{"health":"GOOD"}')
        .then(destroy);
});
