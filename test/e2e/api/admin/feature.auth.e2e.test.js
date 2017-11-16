'use strict';

const { test } = require('ava');
const { setupAppWithAuth } = require('./../../helpers/test-helper');

test.serial('creates new feature toggle with createdBy', async t => {
    t.plan(1);
    const { request, destroy } = await setupAppWithAuth('feature_api_auth');
    // Login
    await request.post('/api/admin/login').send({
        email: 'user@mail.com',
    });

    // create toggle
    await request.post('/api/admin/features').send({
        name: 'com.test.Username',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    await request
        .get('/api/admin/events')
        .expect(res => {
            t.true(res.body.events[0].createdBy === 'user@mail.com');
        })
        .then(destroy);
});

test.serial('should require authenticated user', async t => {
    t.plan(0);
    const { request, destroy } = await setupAppWithAuth('feature_api_auth');
    return request
        .get('/api/admin/features')
        .expect(401)
        .then(destroy);
});
