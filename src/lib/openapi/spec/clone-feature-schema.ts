import { createSchemaObject, CreateSchemaType } from '../types';

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
    'components/schemas': {},
} as const;

export type CloneFeatureSchema = CreateSchemaType<typeof schema>;

export const cloneFeatureSchema = createSchemaObject(schema);
