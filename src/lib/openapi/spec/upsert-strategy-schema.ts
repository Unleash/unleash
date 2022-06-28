import { FromSchema } from 'json-schema-to-ts';

export const upsertStrategySchema = {
    $id: '#/components/schemas/upsertStrategySchema',
    type: 'object',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        editable: {
            type: 'boolean',
        },
        parameters: {
            type: 'array',
            items: {
                type: 'object',
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
                    required: {
                        type: 'boolean',
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type UpsertStrategySchema = FromSchema<typeof upsertStrategySchema>;
