'use strict';

const test = require('ava');
const { setupApp } = require('./../../helpers/test-helper');

test.serial('returns events', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('event_api_serial');
    return request
        .get('/api/admin/events')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(destroy);
});

test.serial('returns events given a name', async t => {
    t.plan(0);
    const { request, destroy } = await setupApp('event_api_serial');
    return request
        .get('/api/admin/events/myname')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(destroy);
});
