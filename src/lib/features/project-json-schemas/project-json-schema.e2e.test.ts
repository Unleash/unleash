import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_json_schemas', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    jsonSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );

    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user@getunleash.io',
        })
        .expect(200);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

const createSchema = async (
    projectId: string,
    payload: { name: string; schema: object },
    expectedCode = 201,
) => {
    return app.request
        .post(`/api/admin/projects/${projectId}/json-schemas`)
        .send(payload)
        .expect(expectedCode);
};

const listSchemas = async (projectId: string, expectedCode = 200) => {
    return app.request
        .get(`/api/admin/projects/${projectId}/json-schemas`)
        .expect(expectedCode);
};

const getSchema = async (
    projectId: string,
    schemaId: string,
    expectedCode = 200,
) => {
    return app.request
        .get(`/api/admin/projects/${projectId}/json-schemas/${schemaId}`)
        .expect(expectedCode);
};

const updateSchema = async (
    projectId: string,
    schemaId: string,
    payload: { name: string; schema: object },
    expectedCode = 200,
) => {
    return app.request
        .put(`/api/admin/projects/${projectId}/json-schemas/${schemaId}`)
        .send(payload)
        .expect(expectedCode);
};

const deleteSchema = async (
    projectId: string,
    schemaId: string,
    expectedCode = 204,
) => {
    return app.request
        .delete(`/api/admin/projects/${projectId}/json-schemas/${schemaId}`)
        .expect(expectedCode);
};

test('should create and list JSON schemas for a project', async () => {
    const validSchema = {
        type: 'object',
        properties: {
            name: { type: 'string' },
            age: { type: 'number' },
        },
        required: ['name'],
    };

    const { body: created } = await createSchema('default', {
        name: 'User Schema',
        schema: validSchema,
    });

    expect(created).toMatchObject({
        name: 'User Schema',
        project: 'default',
        schema: validSchema,
    });
    expect(created.id).toBeDefined();
    expect(created.createdAt).toBeDefined();

    const { body: listed } = await listSchemas('default');
    expect(listed.jsonSchemas).toHaveLength(1);
    expect(listed.jsonSchemas[0]).toMatchObject({
        id: created.id,
        name: 'User Schema',
    });
});

test('should get a single JSON schema by id', async () => {
    const { body: created } = await createSchema('default', {
        name: 'Get Test Schema',
        schema: { type: 'object' },
    });

    const { body: fetched } = await getSchema('default', created.id);
    expect(fetched).toMatchObject({
        id: created.id,
        name: 'Get Test Schema',
        project: 'default',
    });
});

test('should update a JSON schema', async () => {
    const { body: created } = await createSchema('default', {
        name: 'Update Test Schema',
        schema: { type: 'object' },
    });

    const updatedSchema = {
        type: 'object',
        properties: { count: { type: 'integer' } },
    };

    const { body: updated } = await updateSchema('default', created.id, {
        name: 'Updated Schema Name',
        schema: updatedSchema,
    });

    expect(updated).toMatchObject({
        id: created.id,
        name: 'Updated Schema Name',
        schema: updatedSchema,
    });
});

test('should delete a JSON schema', async () => {
    const { body: created } = await createSchema('default', {
        name: 'Delete Test Schema',
        schema: { type: 'string' },
    });

    await deleteSchema('default', created.id);

    await getSchema('default', created.id, 404);
});

test('should reject invalid JSON schema on create', async () => {
    // AJV strict mode rejects unknown keywords by default
    await createSchema(
        'default',
        {
            name: 'Invalid Schema',
            schema: { type: 'not-a-real-type' },
        },
        400,
    );
});

test('should reject duplicate schema name in same project', async () => {
    await createSchema('default', {
        name: 'Duplicate Name Test',
        schema: { type: 'object' },
    });

    await createSchema(
        'default',
        {
            name: 'Duplicate Name Test',
            schema: { type: 'string' },
        },
        409,
    );
});
