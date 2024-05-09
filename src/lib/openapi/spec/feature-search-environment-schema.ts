import type { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { variantSchema } from './variant-schema';
import { strategyVariantSchema } from './strategy-variant-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';

export const featureSearchEnvironmentSchema = {
    $id: '#/components/schemas/featureSearchEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'enabled', 'type'],
    description: 'A detailed description of the feature environment',
    properties: {
        ...featureEnvironmentSchema.properties,
        yes: {
            description:
                'How many times the toggle evaluated to true in last hour bucket',
            type: 'integer',
            example: 974,
            minimum: 0,
        },
        no: {
            description:
                'How many times the toggle evaluated to false in last hour bucket',
            type: 'integer',
            example: 50,
            minimum: 0,
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            featureStrategySchema,
            strategyVariantSchema,
            featureEnvironmentSchema,
            variantSchema,
        },
    },
} as const;

export type FeatureSearchEnvironmentSchema = FromSchema<
    typeof featureSearchEnvironmentSchema
>;
