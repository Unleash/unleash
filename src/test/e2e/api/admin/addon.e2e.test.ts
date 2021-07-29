import dbInit from '../../helpers/database-init';
import { setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';

const MASKED_VALUE = '*****';

let app;
let db;

beforeAll(async () => {
    db = await dbInit('addon_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('gets all addons', async () => {
    expect.assertions(3);

    return app.request
        .get('/api/admin/addons')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.addons.length).toBe(0);
            expect(res.body.providers.length).toBe(4);
            expect(res.body.providers[0].name).toBe('webhook');
        });
});

test('should not be able to create invalid addon', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/addons')
        .send({ invalid: 'field' })
        .expect(400);
});

test('should create addon configuration', async () => {
    expect.assertions(0);

    const config = {
        provider: 'webhook',
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    return app.request.post('/api/admin/addons').send(config).expect(201);
});

test('should delete addon configuration', async () => {
    expect.assertions(0);

    const config = {
        provider: 'webhook',
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    const res = await app.request
        .post('/api/admin/addons')
        .send(config)
        .expect(201);

    const { id } = res.body;
    await app.request.delete(`/api/admin/addons/${id}`).expect(200);
});

test('should update addon configuration', async () => {
    expect.assertions(2);

    const config = {
        provider: 'webhook',
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    const res = await app.request
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

    await app.request
        .put(`/api/admin/addons/${id}`)
        .send(updatedConfig)
        .expect(200);

    return app.request
        .get(`/api/admin/addons/${id}`)
        .send(config)
        .expect(200)
        .expect((r) => {
            expect(r.body.parameters.url).toBe(MASKED_VALUE);
            expect(r.body.parameters.bodyTemplate).toBe(
                updatedConfig.parameters.bodyTemplate,
            );
        });
});

test('should not update with invalid addon configuration', async () => {
    expect.assertions(0);

    const config = {
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    await app.request.put('/api/admin/addons/1').send(config).expect(400);
});

test('should not update unknown addon configuration', async () => {
    expect.assertions(0);

    const config = {
        provider: 'webhook',
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    await app.request.put('/api/admin/addons/123123').send(config).expect(404);
});

test('should get addon configuration', async () => {
    expect.assertions(3);

    const config = {
        provider: 'webhook',
        enabled: true,
        parameters: {
            url: 'http://localhost:4242/webhook',
            bodyTemplate: "{'name': '{{event.data.name}}' }",
        },
        events: ['feature-updated', 'feature-created'],
    };

    const res = await app.request
        .post('/api/admin/addons')
        .send(config)
        .expect(201);

    const { id } = res.body;

    await app.request
        .get(`/api/admin/addons/${id}`)
        .expect(200)
        .expect((r) => {
            expect(r.body.provider).toBe(config.provider);
            expect(r.body.parameters.bodyTemplate).toBe(
                config.parameters.bodyTemplate,
            );
            expect(r.body.parameters.url).toBe(MASKED_VALUE);
        });
});

test('should not get unknown addon configuration', async () => {
    expect.assertions(0);

    await app.request.get('/api/admin/addons/445').expect(404);
});

test('should not delete unknown addon configuration', async () => {
    expect.assertions(0);

    return app.request.delete('/api/admin/addons/21231').expect(404);
});
