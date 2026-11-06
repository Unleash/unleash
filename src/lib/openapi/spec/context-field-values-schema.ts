import type { FromSchema } from 'json-schema-to-ts';

export const contextFieldValuesSchema = {
    $id: '#/components/schemas/contextFieldValuesSchema',
    type: 'array',
    description:
        'A list of context field values used in strategy or segment constraints.',
    items: {
        type: 'object',
        additionalProperties: false,
        required: ['contextName', 'value'],
        properties: {
            contextName: {
                type: 'string',
                description: 'The name of the context field.',
                example: 'userId',
            },
            value: {
                type: 'string',
                description:
                    'A context value used by a constraint on the context field.',
                example: '123',
            },
        },
    },

    components: {
        schemas: {},
    },
} as const;

export type ContextFieldValuesSchema = FromSchema<
    typeof contextFieldValuesSchema
>;
