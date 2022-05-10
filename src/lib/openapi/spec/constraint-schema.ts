import { createSchemaObject, CreateSchemaType } from '../types';

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
            enum: [
                'NOT_IN',
                'IN',
                'STR_ENDS_WITH',
                'STR_STARTS_WITH',
                'STR_CONTAINS',
                'NUM_EQ',
                'NUM_GT',
                'NUM_GTE',
                'NUM_LT',
                'NUM_LTE',
                'DATE_AFTER',
                'DATE_BEFORE',
                'SEMVER_EQ',
                'SEMVER_GT',
                'SEMVER_LT',
            ],
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
