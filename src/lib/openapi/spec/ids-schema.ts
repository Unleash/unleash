import type { FromSchema } from 'json-schema-to-ts';

export const idsSchema = {
    $id: '#/components/schemas/idsSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Used for bulk deleting multiple ids',
    required: ['ids'],
    properties: {
        ids: {
            type: 'array',
            description: 'Ids, for instance userid',
            items: {
                type: 'number',
                minimum: 0,
            },
            example: [12, 212],
        },
    },
    components: {},
} as const;

export type IdsSchema = FromSchema<typeof idsSchema>;
