import { createSchemaObject, CreateSchemaType } from '../types';
import { parametersSchema } from './parameters-schema';
import { constraintSchema } from './constraint-schema';

const schema = {
    type: 'object',
    additionalProperties: false,
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

export type CreateStrategySchema = CreateSchemaType<typeof schema>;

export const createStrategySchema = createSchemaObject(schema);
