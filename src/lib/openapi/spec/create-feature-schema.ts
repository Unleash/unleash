import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';

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

export type CreateFeatureSchema = FromSchema<typeof schema>;

export const createFeatureSchema = schema as DeepMutable<typeof schema>;
