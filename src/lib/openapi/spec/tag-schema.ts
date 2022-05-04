import { createSchemaObject, CreateSchemaType } from '../types';

const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['value', 'type'],
    properties: {
        value: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
    },
} as const;

export type TagSchema = CreateSchemaType<typeof schema>;

export const tagSchema = createSchemaObject(schema);
