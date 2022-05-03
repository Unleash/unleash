import { createSchemaObject, CreateSchemaType } from '../types';

const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['contextName', 'operator'],
    properties: {
        contextName: {
            type: 'string',
        },
        operator: {
            type: 'string',
        },
        caseInsensitive: {
            type: 'boolean',
        },
        inverted: {
            type: 'boolean',
        },
        values: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        value: {
            type: 'string',
        },
    },
} as const;

export type ConstraintSchema = CreateSchemaType<typeof schema>;

export const constraintSchema = createSchemaObject(schema);
