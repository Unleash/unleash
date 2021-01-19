'use strict';

const test = require('ava');

const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    const db = await dbInit('addon_api_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('gets all addons', async t => {
    t.plan(3);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/addons')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.addons.length, 0, 'expected 0 configured addons');
            t.is(res.body.providers.length, 3, 'expected 3 addon providers');
            t.is(res.body.providers[0].name, 'webhook');
        });
});

test.serial('should not be able to create invalid addon', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/addons')
        .send({ invalid: 'field' })
        .expect(400);
});

test.serial('should create addon configuration', async t => {
    t.plan(0);
    const request = await setupApp(stores);

    const config = {
        provider: 'webhook',
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    return request
        .post('/api/admin/addons')
        .send(config)
        .expect(201);
});

test.serial('should delete addon configuration', async t => {
    t.plan(0);
    const request = await setupApp(stores);

    const config = {
        provider: 'webhook',
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    const res = await request
        .post('/api/admin/addons')
        .send(config)
        .expect(201);

    const { id } = res.body;
    await request.delete(`/api/admin/addons/${id}`).expect(200);
});

test.serial('should update addon configuration', async t => {
    t.plan(1);
    const request = await setupApp(stores);

    const config = {
        provider: 'webhook',
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    const res = await request
        .post('/api/admin/addons')
        .send(config)
        .expect(201);

    const { id } = res.body;

    const updatedConfig = {
        parameters: {
            url: 'http://example.com',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        ...config,
    };

    await request
        .put(`/api/admin/addons/${id}`)
        .send(updatedConfig)
        .expect(200);

    return request
        .get(`/api/admin/addons/${id}`)
        .send(config)
        .expect(200)
        .expect(r => {
            t.is(r.body.parameters.url, updatedConfig.parameters.url);
        });
});

test.serial('should not update with invalid addon configuration', async t => {
    t.plan(0);
    const request = await setupApp(stores);

    const config = {
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    await request
        .put(`/api/admin/addons/1`)
        .send(config)
        .expect(400);
});

test.serial('should not update unknwn addon configuration', async t => {
    t.plan(0);
    const request = await setupApp(stores);

    const config = {
        provider: 'webhook',
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    await request
        .put(`/api/admin/addons/123123`)
        .send(config)
        .expect(404);
});

test.serial('should get addon configuration', async t => {
    t.plan(1);
    const request = await setupApp(stores);

    const config = {
        provider: 'webhook',
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    const res = await request
        .post('/api/admin/addons')
        .send(config)
        .expect(201);

    const { id } = res.body;

    await request
        .get(`/api/admin/addons/${id}`)
        .expect(200)
        .expect(r => {
            t.is(r.body.provider, config.provider);
        });
});

test.serial('should not get unkown addon configuration', async t => {
    t.plan(0);
    const request = await setupApp(stores);

    await request.get(`/api/admin/addons/445`).expect(404);
});

test.serial('should not delete unknown addon configuration', async t => {
    t.plan(0);
    const request = await setupApp(stores);

    return request.delete('/api/admin/addons/21231').expect(404);
});
