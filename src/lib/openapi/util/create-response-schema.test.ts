import {
    createResponseSchema,
    createResponseSchemas,
    schemaNamed,
    schemaTyped,
} from './create-response-schema';

test('createResponseSchema', () => {
    expect(createResponseSchema('schemaName')).toMatchInlineSnapshot(`
        {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/schemaName",
              },
            },
          },
          "description": "schemaName",
        }
    `);
});

test('createResponseSchemaWithDifferentMedia', () => {
    expect(
        createResponseSchemas('my-schema', {
            'application/json': schemaNamed('schemaName'),
            'text/css': schemaTyped('string'),
        }),
    ).toMatchInlineSnapshot(`
      {
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/schemaName",
            },
          },
          "text/css": {
            "schema": {
              "type": "string",
            },
          },
        },
        "description": "my-schema",
      }
  `);
});
