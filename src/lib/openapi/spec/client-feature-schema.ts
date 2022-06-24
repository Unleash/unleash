import { FromSchema } from 'json-schema-to-ts';
import { variantSchema } from './variant-schema';
import { constraintSchema } from './constraint-schema';
import { overrideSchema } from './override-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';

export const clientFeatureSchema = {
    $id: '#/components/schemas/clientFeatureSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        stale: {
            type: 'boolean',
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            overrideSchema,
            parametersSchema,
            featureStrategySchema,
            variantSchema,
        },
    },
} as const;

export type ClientFeatureSchema = FromSchema<typeof clientFeatureSchema>;
