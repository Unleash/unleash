import { createResponseSchema } from './create-response-schema';

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
