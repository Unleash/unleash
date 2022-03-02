import { createSchemaObject, CreateSchemaType } from '../types';

export const schema = {
    type: 'object',
    required: ['contextName', 'values'],
    properties: {
        contextName: {
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

export type OverrideSchema = CreateSchemaType<typeof schema>;

export const overrideSchema = createSchemaObject(schema);
