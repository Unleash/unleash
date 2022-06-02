import { createSchemaObject, CreateSchemaType } from '../schema';

const schema = {
    type: 'object',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        impressionData: {
            type: 'boolean',
        },
    },
} as const;

export type CreateFeatureSchema = CreateSchemaType<typeof schema>;

export const createFeatureSchema = createSchemaObject(schema);
