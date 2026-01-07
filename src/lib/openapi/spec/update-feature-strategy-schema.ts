import type { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema.js';
import { constraintSchema } from './constraint-schema.js';

export const updateFeatureStrategySchema = {
    $id: '#/components/schemas/updateFeatureStrategySchema',
    type: 'object',
    description: 'Update a strategy configuration in a feature',
    properties: {
        name: {
            type: 'string',
            description: 'The name of the strategy type',
        },
        sortOrder: {
            type: 'number',
            description:
                'The order of the strategy in the list in feature environment configuration',
        },
        constraints: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
            description:
                'A list of the constraints attached to the strategy. See https://docs.getunleash.io/concepts/activation-strategies#constraints',
        },
        title: {
            type: 'string',
            nullable: true,
            description: 'A descriptive title for the strategy',
            example: 'Gradual Rollout 25-Prod',
        },
        disabled: {
            type: 'boolean',
            description:
                'A toggle to disable the strategy. defaults to true. Disabled strategies are not evaluated or returned to the SDKs',
            example: false,
            nullable: true,
        },
        parameters: {
            $ref: '#/components/schemas/parametersSchema',
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
        },
    },
} as const;

export type UpdateFeatureStrategySchema = FromSchema<
    typeof updateFeatureStrategySchema,
    { keepDefaultedPropertiesOptional: true }
>;
