'use strict';

const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('feature_api_client', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

test('returns four feature toggles', async () => {
    const request = await setupApp(stores);
    return request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length).toBe(4);
        });
});

test('returns four feature toggles without createdAt', async () => {
    const request = await setupApp(stores);
    return request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features[0].createdAt).toBeFalsy();
        });
});

test('gets a feature by name', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .get('/api/client/features/featureX')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('cant get feature that does not exist', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .get('/api/client/features/myfeature')
        .expect('Content-Type', /json/)
        .expect(404);
});

test('Can filter features by namePrefix', async () => {
    expect.assertions(2);
    const request = await setupApp(stores);
    return request
        .get('/api/client/features?namePrefix=feature.')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length).toBe(1);
            expect(res.body.features[0].name).toBe('feature.with.variants');
        });
});

test('Can use multiple filters', async () => {
    expect.assertions(3);
    const request = await setupApp(stores);
    await request.post('/api/admin/features').send({
        name: 'test.feature',
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await request.post('/api/admin/features').send({
        name: 'test.feature2',
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await request.post('/api/admin/features').send({
        name: 'notestprefix.feature3',
        type: 'release',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = { value: 'Crazy', type: 'simple' };
    const tag2 = { value: 'tagb', type: 'simple' };
    await request
        .post('/api/admin/features/test.feature/tags')
        .send(tag)
        .expect(201);
    await request
        .post('/api/admin/features/test.feature2/tags')
        .send(tag2)
        .expect(201);
    await request
        .post('/api/admin/features/notestprefix.feature3/tags')
        .send(tag)
        .expect(201);
    await request
        .get('/api/client/features?tag=simple:Crazy')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => expect(res.body.features.length).toBe(2));
    await request
        .get('/api/client/features?namePrefix=test&tag=simple:Crazy')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length).toBe(1);
            expect(res.body.features[0].name).toBe('test.feature');
        });
});
