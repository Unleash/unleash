import type { FromSchema } from 'json-schema-to-ts';

export const updateStrategySchema = {
    $id: '#/components/schemas/updateStrategySchema',
    type: 'object',
    description: 'The data required to update a strategy type.',
    required: ['parameters'],
    properties: {
        description: {
            type: 'string',
            description: 'A description of the strategy type.',
            example:
                'Enable the feature for users who have not logged in before.',
        },
        parameters: {
            type: 'array',
            description:
                'The parameter list lets you pass arguments to your custom activation strategy. These will be made available to your custom strategy implementation.',
            items: {
                type: 'object',
                required: ['name', 'type'],
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the parameter',
                        example: 'Rollout percentage',
                    },
                    type: {
                        type: 'string',
                        description:
                            'The [type of the parameter](https://docs.getunleash.io/concepts/activation-strategies#parameters)',
                        enum: [
                            'string',
                            'percentage',
                            'list',
                            'number',
                            'boolean',
                        ],
                        example: 'percentage',
                    },
                    description: {
                        type: 'string',
                        description:
                            'A description of this strategy parameter. Use this to indicate to the users what the parameter does.',
                        example:
                            'How many percent of users should see this feature?',
                    },
                    required: {
                        type: 'boolean',
                        description:
                            'Whether this parameter must be configured when using the strategy. Defaults to `false`',
                        example: false,
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type UpdateStrategySchema = FromSchema<typeof updateStrategySchema>;
