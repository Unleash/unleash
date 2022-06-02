import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
import { parametersSchema } from './parameters-schema';
import { constraintSchema } from './constraint-schema';

const schema = {
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
            items: constraintSchema,
        },
        parameters: parametersSchema,
    },
} as const;

export type CreateStrategySchema = FromSchema<typeof schema>;

export const createStrategySchema = schema as DeepMutable<typeof schema>;
