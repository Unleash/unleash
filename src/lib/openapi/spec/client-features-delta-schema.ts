import type { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { clientFeatureSchema } from './client-feature-schema';
import { environmentSchema } from './environment-schema';
import { clientSegmentSchema } from './client-segment-schema';
import { overrideSchema } from './override-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { strategyVariantSchema } from './strategy-variant-schema';
import { variantSchema } from './variant-schema';
import { dependentFeatureSchema } from './dependent-feature-schema';

export const clientFeaturesDeltaSchema = {
    $id: '#/components/schemas/clientFeaturesDeltaSchema',
    type: 'object',
    required: ['updated', 'revisionId', 'removed'],
    description: 'Schema for delta updates of feature configurations.',
    properties: {
        updated: {
            description: 'A list of updated feature configurations.',
            type: 'array',
            items: {
                $ref: '#/components/schemas/clientFeatureSchema',
            },
        },
        revisionId: {
            type: 'number',
            description: 'The revision ID of the delta update.',
        },
        removed: {
            description: 'A list of feature names that were removed.',
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            clientFeatureSchema,
            environmentSchema,
            clientSegmentSchema,
            overrideSchema,
            parametersSchema,
            featureStrategySchema,
            strategyVariantSchema,
            variantSchema,
            dependentFeatureSchema,
        },
    },
} as const;

export type ClientFeaturesDeltaSchema = FromSchema<
    typeof clientFeaturesDeltaSchema
>;
