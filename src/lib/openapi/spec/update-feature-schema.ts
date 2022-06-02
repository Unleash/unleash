import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
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
            type: 'boolean',
        },
        archived: {
            type: 'boolean',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
        impressionData: {
            type: 'boolean',
        },
        constraints: {
            type: 'array',
            items: constraintSchema,
        },
    },
} as const;

export type UpdateFeatureSchema = FromSchema<typeof schema>;

export const updateFeatureSchema = schema as DeepMutable<typeof schema>;
