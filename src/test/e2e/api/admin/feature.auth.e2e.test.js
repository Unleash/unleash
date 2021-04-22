'use strict';

const { setupAppWithAuth } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('feature_api_auth', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

test('creates new feature toggle with createdBy', async () => {
    expect.assertions(1);
    const request = await setupAppWithAuth(stores);
    // Login
    await request.post('/api/admin/login').send({
        email: 'user@mail.com',
    });

    // create toggle
    await request
        .post('/api/admin/features')
        .send({
            name: 'com.test.Username',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .expect(201);

    await request.get('/api/admin/events').expect(res => {
        expect(res.body.events[0].createdBy).toBe('user@mail.com');
    });
});

test('should require authenticated user', async () => {
    expect.assertions(0);
    const request = await setupAppWithAuth(stores);
    return request.get('/api/admin/features').expect(401);
});
