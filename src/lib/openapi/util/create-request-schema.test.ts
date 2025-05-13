import { createRequestSchema } from './create-request-schema.js';

test('createRequestSchema', () => {
    expect(createRequestSchema('schemaName')).toMatchInlineSnapshot(`
        {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/schemaName",
              },
            },
          },
          "description": "schemaName",
          "required": true,
        }
    `);
});
