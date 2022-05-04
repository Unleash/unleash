import { createSchemaObject, CreateSchemaType } from '../types';

const schema = {
    type: 'object',
    required: ['name', 'replaceGroupId'],
    properties: {
        name: {
            type: 'string',
        },
        replaceGroupId: {
            type: 'string',
        },
    },
} as const;

export type CloneFeatureSchema = CreateSchemaType<typeof schema>;

export const cloneFeatureSchema = createSchemaObject(schema);
