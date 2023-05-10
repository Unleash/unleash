import { FromSchema } from 'json-schema-to-ts';

export const batchStaleSchema = {
    $id: '#/components/schemas/batchStaleSchema',
    type: 'object',
    required: ['features', 'stale'],
    properties: {
        features: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        stale: {
            type: 'boolean',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type BatchStaleSchema = FromSchema<typeof batchStaleSchema>;
