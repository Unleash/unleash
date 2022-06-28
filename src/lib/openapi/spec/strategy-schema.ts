import { FromSchema } from 'json-schema-to-ts';

export const strategySchema = {
    $id: '#/components/schemas/strategySchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'name',
        'displayName',
        'description',
        'editable',
        'deprecated',
        'parameters',
    ],
    properties: {
        name: {
            type: 'string',
        },
        displayName: {
            type: 'string',
            nullable: true,
        },
        description: {
            type: 'string',
        },
        editable: {
            type: 'boolean',
        },
        deprecated: {
            type: 'boolean',
        },
        parameters: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
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

export type StrategySchema = FromSchema<typeof strategySchema>;
