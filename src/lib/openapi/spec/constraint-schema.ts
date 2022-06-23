import { FromSchema } from 'json-schema-to-ts';
import { ALL_OPERATORS } from '../../util/constants';

export const constraintSchema = {
    $id: '#/components/schemas/constraintSchema',
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
    components: {},
} as const;

export type ConstraintSchema = FromSchema<typeof constraintSchema>;
