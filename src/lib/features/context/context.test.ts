import supertest, { type Test } from 'supertest';
import { createTestConfig } from '../../../test/config/test-config.js';
import createStores from '../../../test/fixtures/store.js';
import { createServices } from '../../services/index.js';
import permissions from '../../../test/fixtures/permissions.js';
import getApp from '../../app.js';
import type TestAgent from 'supertest/lib/agent.d.ts';

async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const perms = permissions();
    const config = createTestConfig({
        preHook: perms.hook,
        server: { baseUriPath: base },
    });
    const stores = createStores();

    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);

    return {
        base,
        request: supertest(app),
    };
}

let base: string;
let request: TestAgent<Test>;

beforeEach(async () => {
    const setup = await getSetup();
    base = setup.base;
    request = setup.request;
});

test('should get all context definitions', () => {
    expect.assertions(2);
    return request
        .get(`${base}/api/admin/context`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.length === 3).toBe(true);
            const envField = res.body.find((c) => c.name === 'environment');
            expect(envField.name === 'environment').toBe(true);
        });
});

test('should get context definition', () => {
    expect.assertions(1);
    return request
        .get(`${base}/api/admin/context/userId`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.name).toBe('userId');
        });
});

test('should be allowed to use new context field name', () => {
    expect.assertions(0);
    return request
        .post(`${base}/api/admin/context/validate`)
        .send({ name: 'new.name' })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('should not be allowed reuse context field name', () => {
    expect.assertions(0);

    return request
        .post(`${base}/api/admin/context/validate`)
        .send({ name: 'environment' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('should create a context field', () => {
    expect.assertions(0);

    return request
        .post(`${base}/api/admin/context`)
        .send({ name: 'fancy', description: 'Bla bla' })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should create a context field with legal values', () => {
    expect.assertions(0);
    return request
        .post(`${base}/api/admin/context`)
        .send({
            name: 'page',
            description: 'Bla bla',
            legalValues: [{ value: 'blue' }, { value: 'red' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should require name when creating a context field', () => {
    expect.assertions(0);

    return request
        .post(`${base}/api/admin/context`)
        .send({ description: 'Bla bla' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should not create a context field with existing name', () => {
    expect.assertions(0);

    return request
        .post(`${base}/api/admin/context`)
        .send({ name: 'userId', description: 'Bla bla' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('should not create a context field with duplicate legal values', () => {
    expect.assertions(0);

    return request
        .post(`${base}/api/admin/context`)
        .send({
            name: 'page',
            description: 'Bla bla',
            legalValues: [{ value: 'blue' }, { value: 'blue' }],
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should update a context field with new legal values', () => {
    expect.assertions(0);

    return request
        .put(`${base}/api/admin/context/environment`)
        .send({
            name: 'environment',
            description: 'Used target application envrionments',
            legalValues: [
                { value: 'local' },
                { value: 'stage' },
                { value: 'production' },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('should add and update a single context field with new legal values', async () => {
    expect.assertions(1);

    // non existent context
    await request
        .post(`${base}/api/admin/context/doesntexist/legalValues`)
        .send({
            value: 'local',
            description: 'Local environment',
        })
        .set('Content-Type', 'application/json')
        .expect(404);

    // invalid schema
    await request
        .post(`${base}/api/admin/context/environment/legal-values`)
        .send({
            valueInvalid: 'invalid schema',
            description: 'Local environment',
        })
        .set('Content-Type', 'application/json')
        .expect(400);

    // add a new context field legal value
    await request
        .post(`${base}/api/admin/context/environment/legal-values`)
        .send({
            value: 'newvalue',
            description: 'new description',
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    // update existing context field legal value description
    await request
        .post(`${base}/api/admin/context/environment/legal-values`)
        .send({
            value: 'newvalue',
            description: 'updated description',
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    const { body } = await request.get(`${base}/api/admin/context/environment`);

    expect(body).toMatchObject({
        name: 'environment',
        legalValues: [
            { value: 'newvalue', description: 'updated description' },
        ],
    });
});

test('should delete a single context field legal value', async () => {
    expect.assertions(1);

    // add a new context field legal value
    await request
        .post(`${base}/api/admin/context/environment/legal-values`)
        .send({
            value: 'valueA',
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    await request
        .post(`${base}/api/admin/context/environment/legal-values`)
        .send({
            value: 'valueB',
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    await request
        .delete(`${base}/api/admin/context/environment/legal-values/valueB`)
        .expect(200);

    const { body } = await request.get(`${base}/api/admin/context/environment`);

    expect(body).toMatchObject({
        name: 'environment',
        legalValues: [{ value: 'valueA' }],
    });

    // verify delete is idempotent
    await request
        .delete(`${base}/api/admin/context/environment/legal-values/valueB`)
        .expect(200);
});

test('should not delete a unknown context field', () => {
    expect.assertions(0);

    return request
        .delete(`${base}/api/admin/context/unknown`)
        .set('Content-Type', 'application/json')
        .expect(404);
});

test('should delete a context field', () => {
    expect.assertions(0);

    return request
        .delete(`${base}/api/admin/context/appName`)
        .set('Content-Type', 'application/json')
        .expect(200);
});

// Tests for context field value types
describe('Context field value types', () => {
    test('should create a context field with String value type', async () => {
        expect.assertions(1);

        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'stringField',
                description: 'A string field',
                valueType: 'String',
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const { body } = await request.get(
            `${base}/api/admin/context/stringField`,
        );
        expect(body.valueType).toBe('String');
    });

    test('should create a context field with Number value type', async () => {
        expect.assertions(1);

        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'numberField',
                description: 'A number field',
                valueType: 'Number',
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const { body } = await request.get(
            `${base}/api/admin/context/numberField`,
        );
        expect(body.valueType).toBe('Number');
    });

    test('should create a context field with Semver value type', async () => {
        expect.assertions(1);

        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'semverField',
                description: 'A semver field',
                valueType: 'Semver',
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const { body } = await request.get(
            `${base}/api/admin/context/semverField`,
        );
        expect(body.valueType).toBe('Semver');
    });

    test('should create a context field with Date value type', async () => {
        expect.assertions(1);

        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'dateField',
                description: 'A date field',
                valueType: 'Date',
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const { body } = await request.get(
            `${base}/api/admin/context/dateField`,
        );
        expect(body.valueType).toBe('Date');
    });

    test('should create a context field without value type (null)', async () => {
        expect.assertions(1);

        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'untypedField',
                description: 'An untyped field',
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const { body } = await request.get(
            `${base}/api/admin/context/untypedField`,
        );
        expect(body.valueType).toBeUndefined();
    });

    test('should create a context field with explicit null value type', async () => {
        expect.assertions(1);

        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'explicitNullField',
                description: 'An explicitly null typed field',
                valueType: undefined,
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const { body } = await request.get(
            `${base}/api/admin/context/explicitNullField`,
        );
        expect(body.valueType).toBeUndefined();
    });

    test('should reject invalid value type', () => {
        expect.assertions(0);

        return request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'invalidField',
                description: 'Invalid type field',
                valueType: 'InvalidType',
            })
            .set('Content-Type', 'application/json')
            .expect(400);
    });

    test('should reject empty string value type', () => {
        expect.assertions(0);

        return request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'emptyTypeField',
                description: 'Empty type field',
                valueType: '',
            })
            .set('Content-Type', 'application/json')
            .expect(400);
    });

    test('should update context field description but will preserve value type', async () => {
        expect.assertions(2);

        // Create field with value type
        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'updateTestField',
                description: 'Original description',
                valueType: 'Number',
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        // Update field description
        await request
            .put(`${base}/api/admin/context/updateTestField`)
            .send({
                name: 'updateTestField',
                description: 'Updated description',
            })
            .set('Content-Type', 'application/json')
            .expect(200);

        const { body } = await request.get(
            `${base}/api/admin/context/updateTestField`,
        );
        expect(body.description).toBe('Updated description');
        expect(body.valueType).toBe('Number'); // Value type should not be preserved
    });

    test('should get all context fields and include value types', async () => {
        expect.assertions(2);

        // Create a field with a specific type
        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'testAllFields',
                description: 'Test field for all fields',
                valueType: 'String',
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const { body } = await request
            .get(`${base}/api/admin/context`)
            .expect(200);

        expect(Array.isArray(body)).toBe(true);

        const testField = body.find(
            (field: any) => field.name === 'testAllFields',
        );
        expect(testField?.valueType).toBe('String');
    });

    test('should handle legal values with different value types', async () => {
        expect.assertions(1);

        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'typedLegalValues',
                description: 'Field with typed legal values',
                valueType: 'String',
                legalValues: [{ value: 'option1' }, { value: 'option2' }],
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const { body } = await request.get(
            `${base}/api/admin/context/typedLegalValues`,
        );
        expect(body.valueType).toBe('String');
    });

    test('should validate case sensitivity of value types', () => {
        expect.assertions(0);

        return request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'caseSensitiveField',
                description: 'Case sensitive field',
                valueType: 'string', // lowercase should be rejected
            })
            .set('Content-Type', 'application/json')
            .expect(400);
    });

    test('should accept all valid value type enum values', async () => {
        const validTypes = ['String', 'Number', 'Semver', 'Date'];

        for (let i = 0; i < validTypes.length; i++) {
            const valueType = validTypes[i];
            await request
                .post(`${base}/api/admin/context`)
                .send({
                    name: `validType${i}`,
                    description: `Valid type ${valueType}`,
                    valueType,
                })
                .set('Content-Type', 'application/json')
                .expect(201);
        }

        expect.assertions(0);
    });

    test('should maintain backward compatibility for existing fields without value type', async () => {
        expect.assertions(1);

        // The environment field should exist from test fixtures and have null value type
        const { body } = await request.get(
            `${base}/api/admin/context/environment`,
        );
        expect(body.valueType).toBeUndefined();
    });

    test('should not update value type on existing context field update', async () => {
        expect.assertions(1);

        // Create field with one type
        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'noUpdateType',
                description: 'No update type field',
                valueType: 'String',
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        // Try to update with different type (should be changed)
        await request
            .put(`${base}/api/admin/context/noUpdateType`)
            .send({
                name: 'noUpdateType',
                description: 'Updated description',
                valueType: 'Number', // This should be ignored
            })
            .set('Content-Type', 'application/json')
            .expect(200);

        const { body } = await request.get(
            `${base}/api/admin/context/noUpdateType`,
        );
        expect(body.valueType).toBe('String'); // Should remain original type
    });

    test('should preserve value type when adding legal values', async () => {
        expect.assertions(1);

        // Create field with type
        await request
            .post(`${base}/api/admin/context`)
            .send({
                name: 'legalValuePreserve',
                description: 'Preserve type with legal values',
                valueType: 'String',
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        // Add legal value
        await request
            .post(`${base}/api/admin/context/legalValuePreserve/legal-values`)
            .send({
                value: 'newValue',
                description: 'New legal value',
            })
            .set('Content-Type', 'application/json')
            .expect(200);

        const { body } = await request.get(
            `${base}/api/admin/context/legalValuePreserve`,
        );
        expect(body.valueType).toBe('String');
    });
});
