import { FromSchema } from 'json-schema-to-ts';

export const strategySchema = {
    $id: '#/components/schemas/strategySchema',
    description:
        'The [activation strategy](https://docs.getunleash.io/reference/activation-strategies) schema',
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
        title: {
            type: 'string',
            nullable: true,
            description: 'An optional title for the strategy',
            example: 'GradualRollout - Prod25',
        },
        name: {
            type: 'string',
            description: 'The name or type of the strategy',
            example: 'flexibleRollout',
        },
        displayName: {
            type: 'string',
            description: 'A human friendly name for the strategy',
            example: 'Gradual Rollout',
            nullable: true,
        },
        description: {
            type: 'string',
            description: 'A short description for the strategy',
            example: 'Gradual rollout to logged in users',
        },
        editable: {
            type: 'boolean',
            description: 'Determines whether the strategy allows for editing',
            example: true,
        },
        deprecated: {
            type: 'boolean',
            description: '',
            example: true,
        },
        parameters: {
            type: 'array',
            description: 'A list of relevant parameters for each strategy',
            items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    name: {
                        type: 'string',
                        example: 'percentage',
                    },
                    type: {
                        type: 'string',
                        example: 'percentage',
                    },
                    description: {
                        type: 'string',
                        example: 'Gradual rollout to logged in users',
                    },
                    required: {
                        type: 'boolean',
                        example: true,
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type StrategySchema = FromSchema<typeof strategySchema>;
