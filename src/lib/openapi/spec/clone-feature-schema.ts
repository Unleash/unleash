import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';

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

export type CloneFeatureSchema = FromSchema<typeof schema>;

export const cloneFeatureSchema = schema as DeepMutable<typeof schema>;
