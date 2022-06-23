import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const strategySchema = {
    $id: '#/components/schemas/strategySchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
        id: {
            type: 'string',
        },
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

export type StrategySchema = FromSchema<typeof strategySchema>;
