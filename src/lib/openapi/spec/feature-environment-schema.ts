import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { variantSchema } from './variant-schema';

export const featureEnvironmentSchema = {
    $id: '#/components/schemas/featureEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'enabled'],
    description: 'A detailed description of the feature environment',
    properties: {
        name: {
            type: 'string',
            example: 'my-dev-env',
            description: 'The name of the environment',
        },
        featureName: {
            type: 'string',
            example: 'disable-comments',
        },
        environment: {
            type: 'string',
        },
        type: {
            type: 'string',
            example: 'development',
            description: 'The type of the environment',
        },
        enabled: {
            type: 'boolean',
            example: true,
            description:
                '`true` if the feature is enabled for the environment, otherwise `false`.',
        },
        sortOrder: {
            type: 'number',
            example: 3,
            description:
                'The sort order of the feature environment in the feature environments list',
        },
        variantCount: {
            type: 'number',
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
            description:
                'A list of activation strategies for the feature environment',
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
            description: 'A list of variants for the feature environment',
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            featureStrategySchema,
            variantSchema,
        },
    },
} as const;

export type FeatureEnvironmentSchema = FromSchema<
    typeof featureEnvironmentSchema
>;
