import { FromSchema } from 'json-schema-to-ts';

export const bulkToggleFeaturesSchema = {
    $id: '#/components/schemas/bulkToggleFeaturesSchema',
    type: 'object',
    required: ['features'],
    properties: {
        features: {
            type: 'array',
            description: 'The features that we want to bulk toggle',
            items: {
                type: 'string',
                description: 'The feature name we want to toggle',
            },
            example: ['feature-a', 'feature-b'],
        },
    },
    components: {},
} as const;

export type BulkToggleFeaturesSchema = FromSchema<
    typeof bulkToggleFeaturesSchema
>;
