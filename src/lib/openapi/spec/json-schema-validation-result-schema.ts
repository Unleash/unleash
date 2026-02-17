import type { FromSchema } from 'json-schema-to-ts';

export const jsonSchemaValidationResultSchema = {
    $id: '#/components/schemas/jsonSchemaValidationResultSchema',
    type: 'object',
    required: ['valid'],
    additionalProperties: false,
    description: 'The result of validating a payload against a JSON schema.',
    properties: {
        valid: {
            type: 'boolean',
            description:
                'Whether the payload is valid according to the schema.',
            example: false,
        },
        errors: {
            type: 'array',
            description:
                'A list of validation error messages. Empty when the payload is valid.',
            items: {
                type: 'string',
            },
            example: ['/ must have required property "name"'],
        },
    },
    components: {},
} as const;

export type JsonSchemaValidationResultSchema = FromSchema<
    typeof jsonSchemaValidationResultSchema
>;
