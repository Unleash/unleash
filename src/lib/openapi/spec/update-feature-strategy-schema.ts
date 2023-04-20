import { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema';
import { constraintSchema } from './constraint-schema';

export const updateFeatureStrategySchema = {
    $id: '#/components/schemas/updateFeatureStrategySchema',
    type: 'object',
    properties: {
        name: {
            type: 'string',
        },
        sortOrder: {
            type: 'number',
        },
        constraints: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
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
    typeof updateFeatureStrategySchema
>;
