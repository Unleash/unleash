import { createSchemaObject, CreateSchemaType } from '../types';
import { constraintSchema } from './constraint-schema';

const schema = {
    type: 'object',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        stale: {
            type: 'string',
        },
        archived: {
            type: 'string',
        },
        createdAt: {
            type: 'string',
        },
        impressionData: {
            type: 'boolean',
        },
        constraints: {
            type: 'array',
            items: { $ref: '#/components/schemas/constraintSchema' },
        },
    },
    'components/schemas': {
        constraintSchema,
    },
} as const;

export type UpdateFeatureSchema = CreateSchemaType<typeof schema>;

export const updateFeatureSchema = createSchemaObject(schema);
