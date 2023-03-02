import {
    createResponseSchema,
    createResponseSchemas,
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
            'application/json': {
                schema: {
                    $ref: `#/components/schemas/schemaName`,
                },
            },
            'text/css': {
                schema: {
                    type: `string`,
                },
            },
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
