import type { FromSchema } from 'json-schema-to-ts';

export const segmentStrategiesSchema = {
    $id: '#/components/schemas/segmentStrategiesSchema',
    type: 'object',
    required: ['strategies'],
    description: 'A collection of strategies belonging to a specified segment.',
    additionalProperties: false,
    properties: {
        strategies: {
            description: 'The list of strategies',
            type: 'array',
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
                        description: 'The ID of the strategy',
                        example: 'e465c813-cffb-4232-b184-82b1d6fe9d3d',
                    },
                    featureName: {
                        type: 'string',
                        description:
                            'The name of the feature flag that this strategy belongs to.',
                        example: 'new-signup-flow',
                    },
                    projectId: {
                        type: 'string',
                        description:
                            'The ID of the project that the strategy belongs to.',
                        example: 'red-vista',
                    },
                    environment: {
                        type: 'string',
                        description:
                            'The ID of the environment that the strategy belongs to.',
                        example: 'development',
                    },
                    strategyName: {
                        type: 'string',
                        description: "The name of the strategy's type.",
                        example: 'flexibleRollout',
                    },
                },
            },
        },
        changeRequestStrategies: {
            description:
                'A list of strategies that use this segment in active change requests.',
            type: 'array',
            items: {
                type: 'object',
                required: [
                    'featureName',
                    'projectId',
                    'environment',
                    'strategyName',
                ],
                properties: {
                    id: {
                        type: 'string',
                        description:
                            "The ID of the strategy. Not present on new strategies that haven't been added to the feature flag yet.",
                        example: 'e465c813-cffb-4232-b184-82b1d6fe9d3d',
                    },
                    featureName: {
                        type: 'string',
                        description:
                            'The name of the feature flag that this strategy belongs to.',
                        example: 'new-signup-flow',
                    },
                    projectId: {
                        type: 'string',
                        description:
                            'The ID of the project that the strategy belongs to.',
                        example: 'red-vista',
                    },
                    environment: {
                        type: 'string',
                        description:
                            'The ID of the environment that the strategy belongs to.',
                        example: 'development',
                    },
                    strategyName: {
                        type: 'string',
                        description: "The name of the strategy's type.",
                        example: 'flexibleRollout',
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type SegmentStrategiesSchema = FromSchema<
    typeof segmentStrategiesSchema
>;
