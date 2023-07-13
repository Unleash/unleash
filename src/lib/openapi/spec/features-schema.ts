import { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema';
import { parametersSchema } from './parameters-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { constraintSchema } from './constraint-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { environmentSchema } from './environment-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';
import { strategyVariantSchema } from './strategy-variant-schema';

export const featuresSchema = {
    $id: '#/components/schemas/featuresSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'features'],
    description: 'A list of features',
    deprecated: true,
    properties: {
        version: {
            type: 'integer',
            description: "The version of the feature's schema",
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
            description: 'A list of features',
        },
    },
    components: {
        schemas: {
            constraintSchema,
            environmentSchema,
            featureSchema,
            overrideSchema,
            featureEnvironmentSchema,
            featureStrategySchema,
            strategyVariantSchema,
            parametersSchema,
            variantSchema,
        },
    },
} as const;

export type FeaturesSchema = FromSchema<typeof featuresSchema>;
