import type { FromSchema } from 'json-schema-to-ts';

export const batchStaleSchema = {
    $id: '#/components/schemas/batchStaleSchema',
    type: 'object',
    description:
        'A list of features to operate on and whether they should be marked as stale or as not stale.',
    required: ['features', 'stale'],
    properties: {
        features: {
            type: 'array',
            description: 'A list of features to mark as (not) stale',
            example: ['my-feature-1', 'my-feature-2', 'my-feature-3'],
            items: {
                type: 'string',
                description: 'A feature name',
                example: 'my-feature-5',
            },
        },
        stale: {
            type: 'boolean',
            example: true,
            description:
                'Whether the list of features should be marked as stale or not stale. If `true`, the features will be marked as stale. If `false`, the features will be marked as not stale.',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type BatchStaleSchema = FromSchema<typeof batchStaleSchema>;
