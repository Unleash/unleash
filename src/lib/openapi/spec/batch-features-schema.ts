import type { FromSchema } from 'json-schema-to-ts';

export const batchFeaturesSchema = {
    $id: '#/components/schemas/batchFeaturesSchema',
    type: 'object',
    description: 'A list of feature flag names for batch operations',
    required: ['features'],
    properties: {
        features: {
            type: 'array',
            items: {
                type: 'string',
            },
            description: 'List of feature flag names',
            example: ['my-feature-4', 'my-feature-5', 'my-feature-6'],
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type BatchFeaturesSchema = FromSchema<typeof batchFeaturesSchema>;
