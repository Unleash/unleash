import type { FromSchema } from 'json-schema-to-ts';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';

export const featureStrategiesSchema = {
    $id: '#/components/schemas/featureStrategiesSchema',
    type: 'array',
    description:
        'A list of activation strategy configurations for a feature in an environment',
    items: {
        $ref: '#/components/schemas/featureStrategySchema',
    },
    components: {
        schemas: {
            featureStrategySchema,
            constraintSchema,
            parametersSchema,
            strategyVariantSchema,
        },
    },
} as const;

export type FeatureStrategiesSchema = FromSchema<
    typeof featureStrategiesSchema
>;
