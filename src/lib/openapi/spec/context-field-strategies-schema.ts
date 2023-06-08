import { FromSchema } from 'json-schema-to-ts';

export const contextFieldStrategiesSchema = {
    $id: '#/components/schemas/segmentStrategiesSchema',
    type: 'object',
    description:
        'A wrapper object containing all for strategies using a specific context field',
    required: ['strategies'],
    properties: {
        strategies: {
            type: 'array',
            description: 'List of strategies using the context field',
            items: {
                type: 'object',
                required: [
                    'id',
                    'featureName',
                    'projectId',
                    'environment',
                    'strategyName',
                ],
                properties: {
                    id: {
                        type: 'string',
                        example: '433ae8d9-dd69-4ad0-bc46-414aedbe9c55',
                        description: 'The ID of the strategy.',
                    },
                    featureName: {
                        type: 'string',
                        example: 'best-feature',
                        description:
                            'The name of the feature that contains this strategy.',
                    },
                    projectId: {
                        type: 'string',
                        description:
                            'The ID of the project that contains this feature.',
                    },
                    environment: {
                        type: 'string',
                        description:
                            'The ID of the environment where this strategy is in.',
                    },
                    strategyName: {
                        type: 'string',
                        description: 'The name of the strategy.',
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type ContextFieldStrategiesSchema = FromSchema<
    typeof contextFieldStrategiesSchema
>;
