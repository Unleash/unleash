import { createSchemaObject, CreateSchemaType } from '../types';

const schema = {
    type: 'object',
    additionalProperties: false,
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
    'components/schemas': {},
} as const;

export type OverrideSchema = CreateSchemaType<typeof schema>;

export const overrideSchema = createSchemaObject(schema);
