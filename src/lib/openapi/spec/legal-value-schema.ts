import { FromSchema } from 'json-schema-to-ts';

export const legalValueSchema = {
    $id: '#/components/schemas/legalValueSchema',
    type: 'object',
    additionalProperties: false,
    required: ['value'],
    properties: {
        value: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type LegalValueSchema = FromSchema<typeof legalValueSchema>;
