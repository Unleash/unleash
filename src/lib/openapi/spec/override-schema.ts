import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';

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
} as const;

export type OverrideSchema = FromSchema<typeof schema>;

export const overrideSchema = schema as DeepMutable<typeof schema>;
