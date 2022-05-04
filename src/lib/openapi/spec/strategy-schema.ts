import { createSchemaObject, CreateSchemaType } from '../types';

export const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'constraints', 'parameters'],
    properties: {
        id: {
            type: 'string',
            nullable: true,
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
        sortOrder: {
            type: 'number',
        },
    },
} as const;

export type StrategySchema = CreateSchemaType<typeof schema>;

export const strategySchema = createSchemaObject(schema);
