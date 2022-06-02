import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const schema = {
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
            items: constraintSchema,
        },
        parameters: parametersSchema,
    },
} as const;

export type StrategySchema = FromSchema<typeof schema>;

export const strategySchema = schema as DeepMutable<typeof schema>;
