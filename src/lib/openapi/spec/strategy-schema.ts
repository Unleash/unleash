import { createSchemaObject, CreateSchemaType } from '../schema';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const strategySchemaDefinition = {
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

export type StrategySchema = CreateSchemaType<typeof strategySchemaDefinition>;

export const strategySchema = createSchemaObject(strategySchemaDefinition);
