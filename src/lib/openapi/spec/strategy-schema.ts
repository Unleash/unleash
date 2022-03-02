import { createSchemaObject, CreateSchemaType } from '../types';

export const schema = {
    type: 'object',
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
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
        parameters: {
            type: 'object',
        },
    },
} as const;

export type StrategySchema = CreateSchemaType<typeof schema>;

export const strategySchema = createSchemaObject(schema);
