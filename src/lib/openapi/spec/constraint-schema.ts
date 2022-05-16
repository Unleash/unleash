import { createSchemaObject, CreateSchemaType } from '../types';
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
    'components/schemas': {},
} as const;

export type ConstraintSchema = CreateSchemaType<typeof schema>;

export const constraintSchema = createSchemaObject(schema);
