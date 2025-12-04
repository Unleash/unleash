import type { FromSchema } from 'json-schema-to-ts';
import { legalValueSchema } from './legal-value-schema.js';

export const updateContextFieldSchema = {
    $id: '#/components/schemas/updateContextFieldSchema',
    type: 'object',
    description: 'Data to update an existing context field configuration.',
    properties: {
        description: {
            type: 'string',
            description: 'A description of the context field',
            example: "The user's subscription tier",
        },
        stickiness: {
            type: 'boolean',
            description:
                '`true` if this field should be available for use with [custom stickiness](https://docs.getunleash.io/concepts/stickiness#custom-stickiness), otherwise `false`',
            example: false,
        },
        sortOrder: {
            type: 'integer',
            description:
                'How this context field should be sorted if no other sort order is selected',
            example: 2,
        },
        legalValues: {
            type: 'array',
            description: 'A list of allowed values for this context field',
            example: [
                { value: 'gold' },
                { value: 'silver' },
                { value: 'crystal' },
            ],
            items: {
                $ref: '#/components/schemas/legalValueSchema',
            },
        },
    },
    components: {
        schemas: {
            legalValueSchema,
        },
    },
} as const;

export type UpdateContextFieldSchema = FromSchema<
    typeof updateContextFieldSchema
>;
