import type { FromSchema } from 'json-schema-to-ts';
import { featureStrategySchema } from './feature-strategy-schema.js';

export const featureStrategiesSchema = {
    $id: '#/components/schemas/featureStrategiesSchema',
    type: 'array',
    description: 'A list of feature strategies',
    items: {
        $ref: '#/components/schemas/featureStrategySchema',
    },
    components: {
        schemas: {
            featureStrategySchema,
        },
    },
} as const;

export type FeatureStrategiesSchema = FromSchema<
    typeof featureStrategiesSchema
>;
