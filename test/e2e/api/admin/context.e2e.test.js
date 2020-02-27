'use strict';

const test = require('ava');

const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    const db = await dbInit('context_api_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('gets all context fields', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/context')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.length, 3, 'expected to have three context fields');
        });
});

test.serial('get the context field', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/context/environment')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.name, 'environment');
        });
});

test.serial('should create context field', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/context')
        .send({
            name: 'country',
            description: 'A Country',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test.serial('should create context field with legalValues', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/context')
        .send({
            name: 'region',
            description: 'A region',
            legalValues: ['north', 'south'],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test.serial('should update context field with legalValues', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .put('/api/admin/context/environment')
        .send({
            name: 'environment',
            description: 'Updated description',
            legalValues: ['dev', 'prod'],
        })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test.serial('should not create context field when name is missing', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/context')
        .send({
            description: 'A Country',
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial(
    'refuses to create a context field with an existing name',
    async t => {
        t.plan(0);
        const request = await setupApp(stores);
        return request
            .post('/api/admin/context')
            .send({ name: 'userId' })
            .set('Content-Type', 'application/json')
            .expect(400);
    }
);

test.serial('should delete context field', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request.delete('/api/admin/context/userId').expect(200);
});

test.serial('refuses to create a context not url-friendly name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/context')
        .send({ name: 'not very nice' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial('should validate name to ok', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/context/validate')
        .send({ name: 'newField' })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test.serial('should validate name to not ok', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/context/validate')
        .send({ name: 'environment' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial('should validate name to not ok for non url-friendly', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/context/validate')
        .send({ name: 'not url friendly' })
        .set('Content-Type', 'application/json')
        .expect(400);
});
