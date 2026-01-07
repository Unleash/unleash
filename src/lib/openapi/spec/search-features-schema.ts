import type { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema.js';
import { variantSchema } from './variant-schema.js';
import { overrideSchema } from './override-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { tagSchema } from './tag-schema.js';
import { featureSearchResponseSchema } from './feature-search-response-schema.js';
import { featureSearchEnvironmentSchema } from './feature-search-environment-schema.js';

export const searchFeaturesSchema = {
    $id: '#/components/schemas/searchFeaturesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['features'],
    description: 'A list of features matching search and filter criteria.',
    properties: {
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSearchResponseSchema',
            },
            description:
                'The full list of features in this project matching search and filter criteria.',
        },
        total: {
            type: 'number',
            description:
                'Total count of the features matching search and filter criteria',
            example: 10,
        },
    },
    components: {
        schemas: {
            featureSearchEnvironmentSchema,
            featureSearchResponseSchema,
            constraintSchema,
            featureStrategySchema,
            strategyVariantSchema,
            overrideSchema,
            parametersSchema,
            variantSchema,
            tagSchema,
        },
    },
} as const;

export type SearchFeaturesSchema = FromSchema<
    typeof searchFeaturesSchema,
    { keepDefaultedPropertiesOptional: true }
>;
