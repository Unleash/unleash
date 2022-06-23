import { FromSchema } from 'json-schema-to-ts';
import { clientFeaturesQuerySchema } from './client-features-query-schema';
import { featureSchema } from './feature-schema';
import { segmentSchema } from './segment-schema';
import { constraintSchema } from './constraint-schema';
import { environmentSchema } from './environment-schema';
import { overrideSchema } from './override-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { variantSchema } from './variant-schema';

export const clientFeaturesSchema = {
    $id: '#/components/schemas/clientFeaturesSchema',
    type: 'object',
    required: ['version', 'features', 'query'],
    properties: {
        version: {
            type: 'number',
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
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
            featureSchema,
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
