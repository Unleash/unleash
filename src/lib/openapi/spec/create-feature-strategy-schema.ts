import type { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';

export const createFeatureStrategySchema = {
    $id: '#/components/schemas/createFeatureStrategySchema',
    type: 'object',
    required: ['name'],
    description: 'Create a strategy configuration in a feature',
    properties: {
        name: {
            type: 'string',
            description: 'The name of the strategy type',
            example: 'flexibleRollout',
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
                'A toggle to disable the strategy. defaults to false. Disabled strategies are not evaluated or returned to the SDKs',
            example: false,
            nullable: true,
        },
        sortOrder: {
            type: 'number',
            description: 'The order of the strategy in the list',
            example: 9999,
        },
        constraints: {
            type: 'array',
            description:
                'A list of the constraints attached to the strategy. See https://docs.getunleash.io/concepts/activation-strategies#constraints',
            example: [
                {
                    values: ['1', '2'],
                    inverted: false,
                    operator: 'IN',
                    contextName: 'appName',
                    caseInsensitive: false,
                },
            ],
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
        variants: {
            type: 'array',
            description: 'Strategy level variants',
            items: {
                $ref: '#/components/schemas/createStrategyVariantSchema',
            },
        },
        parameters: {
            description: 'An object containing the parameters for the strategy',
            example: {
                groupId: 'some_new',
                rollout: '25',
                stickiness: 'sessionId',
            },
            $ref: '#/components/schemas/parametersSchema',
        },
        segments: {
            type: 'array',
            description: 'Ids of segments to use for this strategy',
            example: [1, 2],
            items: {
                type: 'number',
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            createStrategyVariantSchema,
        },
    },
} as const;

export type CreateFeatureStrategySchema = FromSchema<
    typeof createFeatureStrategySchema,
    { keepDefaultedPropertiesOptional: true }
>;
