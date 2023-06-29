import { FromSchema } from 'json-schema-to-ts';
import { clientFeaturesQuerySchema } from './client-features-query-schema';
import { segmentSchema } from './segment-schema';
import { constraintSchema } from './constraint-schema';
import { environmentSchema } from './environment-schema';
import { overrideSchema } from './override-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { clientFeatureSchema } from './client-feature-schema';
import { variantSchema } from './variant-schema';

export const clientFeaturesSchema = {
    $id: '#/components/schemas/clientFeaturesSchema',
    type: 'object',
    required: ['version', 'features'],
    description:
        'Configuration data for server-side SDKs for evaluating feature flags.',
    properties: {
        version: {
            type: 'number',
            description:
                'A version number for the format used in the response. Most Unleash instances now return version 2, which includes segments as a separate array',
            example: 2,
            minimum: 0,
        },
        features: {
            description: 'A list of feature toggles with their configuration',
            type: 'array',
            items: {
                $ref: '#/components/schemas/clientFeatureSchema',
            },
        },
        segments: {
            description:
                'A list of [Segments](https://docs.getunleash.io/reference/segments) configured for this Unleash instance',
            type: 'array',
            items: {
                $ref: '#/components/schemas/segmentSchema',
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
            segmentSchema,
            clientFeaturesQuerySchema,
            overrideSchema,
            parametersSchema,
            featureStrategySchema,
            variantSchema,
        },
    },
} as const;

export type ClientFeaturesSchema = FromSchema<typeof clientFeaturesSchema>;
