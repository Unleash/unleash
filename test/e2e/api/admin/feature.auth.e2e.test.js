'use strict';

const test = require('ava');
const { setupAppWithAuth } = require('./../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    stores = await dbInit('feature_api_auth', getLogger);
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('creates new feature toggle with createdBy', async t => {
    t.plan(1);
    const request = await setupAppWithAuth(stores);
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

    await request.get('/api/admin/events').expect(res => {
        t.true(res.body.events[0].createdBy === 'user@mail.com');
    });
});

test.serial('should require authenticated user', async t => {
    t.plan(0);
    const request = await setupAppWithAuth(stores);
    return request.get('/api/admin/features').expect(401);
});
