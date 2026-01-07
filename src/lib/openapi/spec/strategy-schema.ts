import type { FromSchema } from 'json-schema-to-ts';

export const strategySchema = {
    $id: '#/components/schemas/strategySchema',
    description:
        'The [activation strategy](https://docs.getunleash.io/concepts/activation-strategies) schema',
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
            description: 'The name (type) of the strategy',
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
            nullable: true,
            description: 'A short description of the strategy',
            example: 'Gradual rollout to logged in users',
        },
        editable: {
            type: 'boolean',
            description:
                'Whether the strategy can be edited or not. Strategies bundled with Unleash cannot be edited.',
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
