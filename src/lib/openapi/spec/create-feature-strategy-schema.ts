import { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema';
import { constraintSchema } from './constraint-schema';

export const createFeatureStrategySchema = {
    $id: '#/components/schemas/createFeatureStrategySchema',
    type: 'object',
    required: ['name'],
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
        copyOf: {
            type: 'string',
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

export type CreateFeatureStrategySchema = FromSchema<
    typeof createFeatureStrategySchema
>;
