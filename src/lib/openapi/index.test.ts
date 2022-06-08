import {
    createOpenApiSchema,
    createRequestSchema,
    createResponseSchema,
    removeJsonSchemaProps,
} from './index';

test('createRequestSchema', () => {
    expect(createRequestSchema('schemaName')).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "application/json": Object {
              "schema": Object {
                "$ref": "#/components/schemas/schemaName",
              },
            },
          },
          "description": "schemaName",
          "required": true,
        }
    `);
});

test('createResponseSchema', () => {
    expect(createResponseSchema('schemaName')).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "application/json": Object {
              "schema": Object {
                "$ref": "#/components/schemas/schemaName",
              },
            },
          },
          "description": "schemaName",
        }
    `);
});

test('removeJsonSchemaProps', () => {
    expect(removeJsonSchemaProps({ a: 'b', $id: 'c', components: {} }))
        .toMatchInlineSnapshot(`
        Object {
          "a": "b",
        }
    `);
});

test('createOpenApiSchema url', () => {
    expect(createOpenApiSchema('https://example.com').servers[0].url).toEqual(
        'https://example.com',
    );
});
