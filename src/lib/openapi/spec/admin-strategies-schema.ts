import { FromSchema } from 'json-schema-to-ts';

export const segmentStrategiesSchema = {
    $id: '#/components/schemas/segmentStrategiesSchema',
    type: 'object',
    required: ['strategies'],
    description:
        'A collection of strategies using the specified segment, as well as any strategies using the segment in active change requests.',
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
                'A list of strategies using the segment in active change requests. If a strategy is already using the segment outside of any change requests, it will not be listed here.',
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
                            'The ID of the strategy, if available. Strategies added in the change request will not have this property.',
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
