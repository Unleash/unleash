import { FromSchema } from 'json-schema-to-ts';
import { variantSchema } from './variant-schema';
import { constraintSchema } from './constraint-schema';
import { overrideSchema } from './override-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { tagSchema } from './tag-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';
import { strategyVariantSchema } from './strategy-variant-schema';

export const featureTypeCountSchema = {
    $id: '#/components/schemas/featureTypeCountSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    description: 'A count of feature flags of a specific type',
    properties: {
        type: {
            type: 'string',
            example: 'kill-switch',
            description:
                'Type of the flag e.g. experiment, kill-switch, release, operational, permission',
        },
        count: {
            type: 'number',
            example: 1,
            description: 'Number of feature flags of this type',
        },
    },
    components: {
        schemas: {
            constraintSchema,
            featureEnvironmentSchema,
            featureStrategySchema,
            strategyVariantSchema,
            overrideSchema,
            parametersSchema,
            variantSchema,
            tagSchema,
        },
    },
} as const;

export type FeatureTypeCountSchema = FromSchema<typeof featureTypeCountSchema>;
