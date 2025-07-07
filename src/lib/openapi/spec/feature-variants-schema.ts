import { variantSchema } from './variant-schema.js';
import type { FromSchema } from 'json-schema-to-ts';
import { overrideSchema } from './override-schema.js';

export const featureVariantsSchema = {
    $id: '#/components/schemas/featureVariantsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'variants'],
    description: 'A versioned collection of feature flag variants.',
    properties: {
        version: {
            type: 'integer',
            example: 1,
            description: 'The version of the feature variants schema.',
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
            description: 'All variants defined for a specific feature flag.',
        },
    },
    components: {
        schemas: {
            variantSchema,
            overrideSchema,
        },
    },
} as const;

export type FeatureVariantsSchema = FromSchema<typeof featureVariantsSchema>;
