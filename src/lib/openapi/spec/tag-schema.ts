import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';

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

export type TagSchema = FromSchema<typeof schema>;

export const tagSchema = schema as DeepMutable<typeof schema>;
