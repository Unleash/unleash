import { FromSchema } from 'json-schema-to-ts';

export const legalValueSchema = {
    $id: '#/components/schemas/legalValueSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'Describes a legal value. Typically used to limit possible values for contextFields or strategy properties',
    required: ['value'],
    properties: {
        value: {
            description: 'The valid value',
            type: 'string',
            example: 'red',
        },
        description: {
            description: 'Describes the intended usage of this value',
            type: 'string',
            example: 'We only carry these colors in our shop',
        },
    },
    components: {},
} as const;

export type LegalValueSchema = FromSchema<typeof legalValueSchema>;
