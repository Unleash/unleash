import { createSchemaObject, CreateSchemaType } from '../types';

export const schema = {
    type: 'object',
    required: ['contextName', 'operator'],
    properties: {
        contextName: {
            type: 'string',
        },
        operator: {
            type: 'string',
        },
        values: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
} as const;

export type ConstraintSchema = CreateSchemaType<typeof schema>;

export const constraintSchema = createSchemaObject(schema);
