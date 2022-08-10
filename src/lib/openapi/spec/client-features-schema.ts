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
    properties: {
        version: {
            type: 'number',
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/clientFeatureSchema',
            },
        },
        segments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/segmentSchema',
            },
        },
        query: {
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
