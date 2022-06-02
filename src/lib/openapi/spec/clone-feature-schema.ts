import { createSchemaObject, CreateSchemaType } from '../schema';

const schema = {
    type: 'object',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        replaceGroupId: {
            type: 'boolean',
        },
    },
} as const;

export type CloneFeatureSchema = CreateSchemaType<typeof schema>;

export const cloneFeatureSchema = createSchemaObject(schema);
