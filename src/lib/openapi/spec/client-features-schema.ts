import type { FromSchema } from 'json-schema-to-ts';
import { clientFeaturesQuerySchema } from './client-features-query-schema.js';
import { clientSegmentSchema } from './client-segment-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { environmentSchema } from './environment-schema.js';
import { overrideSchema } from './override-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { clientFeatureSchema } from './client-feature-schema.js';
import { variantSchema } from './variant-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { dependentFeatureSchema } from './dependent-feature-schema.js';

export const clientFeaturesSchema = {
    $id: '#/components/schemas/clientFeaturesSchema',
    type: 'object',
    required: ['version', 'features'],
    description:
        'Configuration data for backend SDKs for evaluating feature flags.',
    properties: {
        version: {
            type: 'number',
            description:
                'A version number for the format used in the response. Most Unleash instances now return version 2, which includes segments as a separate array',
            example: 2,
            minimum: 0,
        },
        features: {
            description: 'A list of feature flags with their configuration',
            type: 'array',
            items: {
                $ref: '#/components/schemas/clientFeatureSchema',
            },
        },
        segments: {
            description:
                'A list of [Segments](https://docs.getunleash.io/concepts/segments) configured for this Unleash instance',
            type: 'array',
            items: {
                $ref: '#/components/schemas/clientSegmentSchema',
            },
        },
        query: {
            description:
                'A summary of filters and parameters sent to the endpoint. Used by the server to build the features and segments response',
            $ref: '#/components/schemas/clientFeaturesQuerySchema',
        },
    },
    components: {
        schemas: {
            constraintSchema,
            clientFeatureSchema,
            environmentSchema,
            clientSegmentSchema,
            clientFeaturesQuerySchema,
            overrideSchema,
            parametersSchema,
            featureStrategySchema,
            strategyVariantSchema,
            variantSchema,
            dependentFeatureSchema,
        },
    },
} as const;

export type ClientFeaturesSchema = FromSchema<
    typeof clientFeaturesSchema,
    { keepDefaultedPropertiesOptional: true }
>;
