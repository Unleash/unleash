import type { FromSchema } from 'json-schema-to-ts';

export const validateJsonSchemaPayloadSchema = {
    $id: '#/components/schemas/validateJsonSchemaPayloadSchema',
    type: 'object',
    required: ['payload'],
    additionalProperties: false,
    description:
        'Data used to validate a JSON payload against a project JSON schema.',
    properties: {
        payload: {
            type: 'string',
            description: 'The raw JSON string to validate against the schema.',
            example: '{"key": "value"}',
        },
    },
    components: {},
} as const;

export type ValidateJsonSchemaPayloadSchema = FromSchema<
    typeof validateJsonSchemaPayloadSchema
>;
