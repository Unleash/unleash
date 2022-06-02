import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
import { ALL_OPERATORS } from '../../util/constants';

const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['contextName', 'operator'],
    properties: {
        contextName: {
            type: 'string',
        },
        operator: {
            type: 'string',
            enum: ALL_OPERATORS,
        },
        caseInsensitive: {
            type: 'boolean',
        },
        inverted: {
            type: 'boolean',
        },
        values: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        value: {
            type: 'string',
        },
    },
} as const;

export type ConstraintSchema = FromSchema<typeof schema>;

export const constraintSchema = schema as DeepMutable<typeof schema>;
