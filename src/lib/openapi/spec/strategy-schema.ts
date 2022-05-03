import { createSchemaObject, CreateSchemaType } from '../types';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'constraints', 'parameters'],
    properties: {
        id: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        constraints: {
            type: 'array',
            items: constraintSchema,
        },
        parameters: parametersSchema,
    },
} as const;

export type StrategySchema = CreateSchemaType<typeof schema>;

export const strategySchema = createSchemaObject(schema);
