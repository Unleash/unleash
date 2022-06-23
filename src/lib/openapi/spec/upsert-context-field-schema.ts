import { FromSchema } from 'json-schema-to-ts';
import { legalValueSchema } from './legal-value-schema';

export const upsertContextFieldSchema = {
    $id: '#/components/schemas/upsertContextFieldSchema',
    type: 'object',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        stickiness: {
            type: 'boolean',
        },
        sortOrder: {
            type: 'number',
        },
        legalValues: {
            type: 'array',
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

export type UpsertContextFieldSchema = FromSchema<
    typeof upsertContextFieldSchema
>;
