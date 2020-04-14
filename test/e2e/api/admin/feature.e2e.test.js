'use strict';

const test = require('ava');
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    const db = await dbInit('feature_api_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('returns list of feature toggles', async t => {
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 4);
        });
});

test.serial('gets a feature by name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features/featureX')
        .expect('Content-Type', /json/)
        .expect(200);
});

test.serial('cant get feature that dose not exist', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features/myfeature')
        .expect('Content-Type', /json/)
        .expect(404);
});

test.serial('creates new feature toggle', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({
            name: 'com.test.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test.serial('creates new feature toggle with variants', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({
            name: 'com.test.variants',
            enabled: false,
            strategies: [{ name: 'default' }],
            variants: [
                { name: 'variant1', weight: 50 },
                { name: 'variant2', weight: 50 },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test.serial('fetch feature toggle with variants', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features/feature.with.variants')
        .expect(res => {
            t.true(res.body.variants.length === 2);
        });
});

test.serial('creates new feature toggle with createdBy unknown', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    await request.post('/api/admin/features').send({
        name: 'com.test.Username',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    await request.get('/api/admin/events').expect(res => {
        t.true(res.body.events[0].createdBy === 'none@unknown.com');
    });
});

test.serial('require new feature toggle to have a name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({ name: '' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial(
    'can not change status of feature toggle that does not exist',
    async t => {
        t.plan(0);
        const request = await setupApp(stores);
        return request
            .put('/api/admin/features/should-not-exist')
            .send({ name: 'should-not-exist', enabled: false })
            .set('Content-Type', 'application/json')
            .expect(404);
    },
);

test.serial('can change status of feature toggle that does exist', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .put('/api/admin/features/featureY')
        .send({
            name: 'featureY',
            enabled: true,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test.serial('can not toggle of feature that does not exist', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features/should-not-exist/toggle')
        .set('Content-Type', 'application/json')
        .expect(404);
});

test.serial('can toggle a feature that does exist', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features/featureY/toggle')
        .set('Content-Type', 'application/json')
        .expect(200);
});

test.serial('archives a feature by name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request.delete('/api/admin/features/featureX').expect(200);
});

test.serial('can not archive unknown feature', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request.delete('/api/admin/features/featureUnknown').expect(404);
});

test.serial('refuses to create a feature with an existing name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({ name: 'featureX' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial('refuses to validate a feature with an existing name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features/validate')
        .send({ name: 'featureX' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial(
    'new strategies api can add two strategies to a feature toggle',
    async t => {
        t.plan(0);
        const request = await setupApp(stores);
        return request
            .put('/api/admin/features/featureY')
            .send({
                name: 'featureY',
                description: 'soon to be the #14 feature',
                enabled: false,
                strategies: [
                    {
                        name: 'baz',
                        parameters: { foo: 'bar' },
                    },
                ],
            })
            .set('Content-Type', 'application/json')
            .expect(200);
    },
);

test.serial('should not be possible to create archived toggle', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({
            name: 'featureArchivedX',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial('creates new feature toggle with variant overrides', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({
            name: 'com.test.variants.overrieds',
            enabled: false,
            strategies: [{ name: 'default' }],
            variants: [
                {
                    name: 'variant1',
                    weight: 50,
                    overrides: [
                        {
                            contextName: 'userId',
                            values: ['123'],
                        },
                    ],
                },
                { name: 'variant2', weight: 50 },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});
