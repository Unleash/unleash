import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';

export const featureEnvironmentSchema = {
    $id: '#/components/schemas/featureEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'enabled'],
    properties: {
        name: {
            type: 'string',
        },
        featureName: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            featureStrategySchema,
        },
    },
} as const;

export type FeatureEnvironmentSchema = FromSchema<
    typeof featureEnvironmentSchema
>;
