import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import { v4 as uuidv4 } from 'uuid';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import { DEFAULT_ENV } from '../../../../lib/server-impl.js';

let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('context_api_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('gets all context fields', async () => {
    expect.assertions(1);
    const { body } = await app.request
        .get('/api/admin/context')
        .expect('Content-Type', /json/)
        .expect(200);

    // because tests share the database, we might have more fields than expected
    expect(body.map((field) => field.name)).toEqual(
        expect.arrayContaining(['environment', 'userId', 'sessionId']),
    );
});

test('get the context field', async () => {
    expect.assertions(1);
    return app.request
        .get('/api/admin/context/environment')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.name).toBe('environment');
        });
});

test('should create context field', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/context')
        .send({
            name: 'country',
            description: 'A Country',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should create context field with legalValues', async () => {
    expect.assertions(3);

    const data = {
        name: 'region',
        description: 'A region',
        legalValues: [
            { value: 'north' },
            { value: 'south', description: 'south-desc' },
        ],
    };

    await app.request
        .post('/api/admin/context')
        .send(data)
        .set('Content-Type', 'application/json')
        .expect(201);

    const res = await app.request.get(`/api/admin/context/${data.name}`);
    expect(res.body.name).toEqual(data.name);
    expect(res.body.description).toEqual(data.description);
    expect(res.body.legalValues).toEqual(data.legalValues);
});

test('should update context field with legalValues', async () => {
    expect.assertions(3);

    const data = {
        name: 'environment',
        description: 'Updated description',
        legalValues: [
            { value: 'dev', description: 'dev-desc' },
            { value: 'prod' },
        ],
    };

    await app.request
        .put('/api/admin/context/environment')
        .send(data)
        .set('Content-Type', 'application/json')
        .expect(200);

    const res = await app.request.get(`/api/admin/context/${data.name}`);
    expect(res.body.name).toEqual(data.name);
    expect(res.body.description).toEqual(data.description);
    expect(res.body.legalValues).toEqual(data.legalValues);
});

test('should reject string legalValues', async () => {
    await app.request
        .put('/api/admin/context/environment')
        .send({ name: 'environment', legalValues: ['a'] })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should reject empty legalValues', async () => {
    await app.request
        .put('/api/admin/context/environment')
        .send({ name: 'environment', legalValues: [{ description: 'b' }] })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should reject legalValues without value', async () => {
    await app.request
        .put('/api/admin/context/environment')
        .send({ name: 'environment', legalValues: [{ description: 'b' }] })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should create context field with stickiness', async () => {
    expect.assertions(1);
    const name = 'with-sticky';
    await app.request
        .post('/api/admin/context')
        .send({
            name,
            description: 'A context field supporting stickiness',
            stickiness: true,
        })
        .set('Content-Type', 'application/json');

    const res = await app.request.get(`/api/admin/context/${name}`);
    const contextField = res.body;

    expect(contextField.stickiness).toBe(true);
});

test('should not create context field when name is missing', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/context')
        .send({
            description: 'A Country',
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('refuses to create a context field with an existing name', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/context')
        .send({ name: 'userId' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('should delete context field', async () => {
    expect.assertions(0);
    return app.request.delete('/api/admin/context/userId').expect(200);
});

test('should not delete a context field that is in use by active flags', async () => {
    const context = 'appName';
    const feature = uuidv4();
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: feature,
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post(
            `/api/admin/projects/default/features/${feature}/environments/${DEFAULT_ENV}/strategies`,
        )
        .send({
            name: 'default',
            constraints: [
                {
                    contextName: context,
                    operator: 'IN',
                    values: ['test'],
                    caseInsensitive: false,
                    inverted: false,
                },
            ],
        })
        .expect(200);

    app.request.delete(`/api/admin/context/${context}`).expect(409);

    await app.archiveFeature(feature).expect(202);

    const { body: postArchiveBody } = await app.request.get(
        `/api/admin/context/${context}/strategies`,
    );

    expect(postArchiveBody.strategies).toHaveLength(0);
});

test('refuses to create a context not url-friendly name', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/context')
        .send({ name: 'not very nice' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should validate name to ok', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/context/validate')
        .send({ name: 'newField' })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('should validate name to not ok', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/context/validate')
        .send({ name: 'environment' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('should validate name to not ok for non url-friendly', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/context/validate')
        .send({ name: 'not url friendly' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should update context field with stickiness', async () => {
    const name = 'with-sticky-update';
    await app.request
        .post('/api/admin/context')
        .send({
            name,
            description: 'A context field supporting stickiness',
        })
        .set('Content-Type', 'application/json');
    await app.request
        .put(`/api/admin/context/${name}`)
        .send({
            description: 'asd',
            legalValues: [],
            name,
            stickiness: true,
        })
        .set('Content-Type', 'application/json');

    const res = await app.request.get(`/api/admin/context/${name}`);
    const contextField = res.body;

    expect(contextField.description).toBe('asd');
    expect(contextField.stickiness).toBe(true);
});

test('should show context field usage for active flags', async () => {
    const context = 'appName';
    const feature = 'contextFeature';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: feature,
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post(
            `/api/admin/projects/default/features/${feature}/environments/${DEFAULT_ENV}/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: '14',
            },
            constraints: [
                {
                    contextName: context,
                    operator: 'IN',
                    values: ['test'],
                    caseInsensitive: false,
                    inverted: false,
                },
            ],
        })
        .expect(200);

    await app.request.post('/api/admin/context').send({
        name: context,
        description: context,
    });

    const { body } = await app.request.get(
        `/api/admin/context/${context}/strategies`,
    );

    expect(body.strategies).toHaveLength(1);
    expect(body).toMatchObject({
        strategies: [
            { environment: DEFAULT_ENV, featureName: 'contextFeature' },
        ],
    });

    const { body: getAllBody } = await app.request
        .get(`/api/admin/context`)
        .expect(200);

    expect(
        getAllBody.find((field) => field.name === context)?.usedInFeatures,
    ).toBe(1);

    await app.archiveFeature('contextFeature').expect(202);

    const { body: postArchiveBody } = await app.request.get(
        `/api/admin/context/${context}/strategies`,
    );

    expect(postArchiveBody.strategies).toHaveLength(0);

    const { body: getContextBody } = await app.request.get(
        `/api/admin/context/${context}/strategies`,
    );

    const { body: postArchiveGetAllBody } = await app.request
        .get(`/api/admin/context`)
        .expect(200);

    expect(
        postArchiveGetAllBody.find((field) => field.name === context)
            ?.usedInFeatures,
    ).toBe(0);
});
