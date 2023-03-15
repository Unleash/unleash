import { FromSchema } from 'json-schema-to-ts';

export const batchFeaturesSchema = {
    $id: '#/components/schemas/batchFeaturesSchema',
    type: 'object',
    required: ['features'],
    properties: {
        features: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type BatchFeaturesSchema = FromSchema<typeof batchFeaturesSchema>;
