'use strict';

const test = require('ava');
const { setupApp } = require('./util/test-helper');
const logger = require('../../lib/logger');

test.beforeEach(() =>  {
    logger.setLevel('FATAL');
});

test.serial('returns events', async (t) => {
    const { request, destroy } = await setupApp('event_api_serial');
    return request
        .get('/api/events')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(destroy);
});

test.serial('returns events given a name', async (t) => {
    const { request, destroy } = await setupApp('event_api_serial');
    return request
        .get('/api/events/myname')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(destroy);
});
