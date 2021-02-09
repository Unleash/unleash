'use strict';

const test = require('ava');
const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    const db = await dbInit('feature_api_client', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('returns four feature toggles', async t => {
    const request = await setupApp(stores);
    return request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.features.length, 4);
        });
});

test.serial('returns four feature toggles without createdAt', async t => {
    const request = await setupApp(stores);
    return request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.falsy(res.body.features[0].createdAt);
        });
});

test.serial('gets a feature by name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/client/features/featureX')
        .expect('Content-Type', /json/)
        .expect(200);
});

test.serial('cant get feature that does not exist', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/client/features/myfeature')
        .expect('Content-Type', /json/)
        .expect(404);
});

test.serial('Can filter features by namePrefix', async t => {
    t.plan(2);
    const request = await setupApp(stores);
    return request
        .get('/api/client/features?namePrefix=feature.')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.features.length, 1);
            t.is(res.body.features[0].name, 'feature.with.variants');
        });
});

test.serial('Can use multiple filters', async t => {
    t.plan(3);
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
        .expect(res => t.is(res.body.features.length, 2));
    await request
        .get('/api/client/features?namePrefix=test&tag=simple:Crazy')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.features.length, 1);
            t.is(res.body.features[0].name, 'test.feature');
        });
});
