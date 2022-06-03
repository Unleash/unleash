import { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema';
import { constraintSchema } from './constraint-schema';

export const createStrategySchema = {
    $id: '#/components/schemas/createStrategySchema',
    type: 'object',
    additionalProperties: false,
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

export type CreateStrategySchema = FromSchema<typeof createStrategySchema>;
