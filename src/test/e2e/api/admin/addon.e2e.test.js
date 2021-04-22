'use strict';;
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

const MASKED_VALUE = '*****';

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('addon_api_serial', getLogger);
    stores = db.stores;
});

test(async () => {
    await db.destroy();
});

test('gets all addons', async () => {
    expect.assertions(3);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/addons')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.addons.length).toBe(0);
            expect(res.body.providers.length).toBe(2);
            expect(res.body.providers[0].name).toBe('webhook');
        });
});

test('should not be able to create invalid addon', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/addons')
        .send({ invalid: 'field' })
        .expect(400);
});

test('should create addon configuration', async () => {
    expect.assertions(0);
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

test('should delete addon configuration', async () => {
    expect.assertions(0);
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

test('should update addon configuration', async () => {
    expect.assertions(2);
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
            expect(r.body.parameters.url).toBe(MASKED_VALUE);
            expect(r.body.parameters.bodyTemplate).toBe(updatedConfig.parameters.bodyTemplate);
        });
});

test('should not update with invalid addon configuration', async () => {
    expect.assertions(0);
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
        .put('/api/admin/addons/1')
        .send(config)
        .expect(400);
});

test('should not update unknown addon configuration', async () => {
    expect.assertions(0);
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
        .put('/api/admin/addons/123123')
        .send(config)
        .expect(404);
});

test('should get addon configuration', async () => {
    expect.assertions(3);
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
            expect(r.body.provider).toBe(config.provider);
            expect(r.body.parameters.bodyTemplate).toBe(config.parameters.bodyTemplate);
            expect(r.body.parameters.url).toBe(MASKED_VALUE);
        });
});

test('should not get unknown addon configuration', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);

    await request.get('/api/admin/addons/445').expect(404);
});

test('should not delete unknown addon configuration', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);

    return request.delete('/api/admin/addons/21231').expect(404);
});
