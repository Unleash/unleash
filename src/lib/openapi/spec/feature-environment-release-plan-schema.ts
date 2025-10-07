import type { FromSchema } from 'json-schema-to-ts';

export const featureEnvironmentReleasePlanSchema = {
    $id: '#/components/schemas/featureEnvironmentReleasePlanSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'id',
        'name',
        'featureName',
        'environment',
        'createdAt',
        'milestones',
    ],
    description: 'A release plan for a feature in an environment',
    properties: {
        id: {
            type: 'string',
            example: '01JTJNCJ5XVP2KPJFA03YRBZCA',
            description: 'The unique identifier of the release plan',
        },
        name: {
            type: 'string',
            example: 'Progressive Rollout',
            description: 'The name of the release plan',
        },
        description: {
            type: 'string',
            nullable: true,
            example: 'A gradual rollout to production users',
            description: 'Optional description of the release plan',
        },
        featureName: {
            type: 'string',
            example: 'disable-comments',
            description: 'The feature flag this plan applies to',
        },
        environment: {
            type: 'string',
            example: 'production',
            description: 'The environment this plan applies to',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-28T15:21:39.975Z',
            description: 'When the release plan was created',
        },
        createdByUserId: {
            type: 'integer',
            example: 123,
            description: 'The ID of the user who created the release plan',
        },
        activeMilestoneId: {
            type: 'string',
            nullable: true,
            example: '01JTJNCJ5XVP2KPJFA03YRBZCA',
            description: 'The ID of the currently active milestone',
        },
        releasePlanTemplateId: {
            type: 'string',
            example: '01JTJNCJ5XVP2KPJFA03YRBZCA',
            description: 'The ID of the template this plan was created from',
        },
        milestones: {
            type: 'array',
            description: 'The list of milestones in this release plan',
            items: {
                type: 'object',
                additionalProperties: false,
                required: [
                    'id',
                    'name',
                    'sortOrder',
                    'releasePlanDefinitionId',
                ],
                properties: {
                    id: {
                        type: 'string',
                        example: '01JTJNCJ5XVP2KPJFA03YRBZCA',
                        description: 'The unique identifier of the milestone',
                    },
                    name: {
                        type: 'string',
                        example: 'Phase 1',
                        description: 'The name of the milestone',
                    },
                    sortOrder: {
                        type: 'integer',
                        example: 0,
                        description:
                            'The order of this milestone in the release plan',
                    },
                    releasePlanDefinitionId: {
                        type: 'string',
                        example: '01JTJNCJ5XVP2KPJFA03YRBZCA',
                        description:
                            'The ID of the release plan this milestone belongs to',
                    },
                    startedAt: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        example: '2023-01-28T15:21:39.975Z',
                        description: 'When this milestone was started',
                    },
                    strategies: {
                        type: 'array',
                        description:
                            'The strategies configured for this milestone',
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            required: [
                                'id',
                                'milestoneId',
                                'sortOrder',
                                'strategyName',
                            ],
                            properties: {
                                id: {
                                    type: 'string',
                                    example: '01JTJNCJ5XVP2KPJFA03YRBZCA',
                                    description:
                                        'The unique identifier of the strategy',
                                },
                                milestoneId: {
                                    type: 'string',
                                    example: '01JTJNCJ5XVP2KPJFA03YRBZCA',
                                    description:
                                        'The ID of the milestone this strategy belongs to',
                                },
                                sortOrder: {
                                    type: 'integer',
                                    example: 0,
                                    description:
                                        'The order of this strategy in the milestone',
                                },
                                strategyName: {
                                    type: 'string',
                                    example: 'flexibleRollout',
                                    description:
                                        'The name of the strategy type',
                                },
                                title: {
                                    type: 'string',
                                    nullable: true,
                                    example: '10% rollout',
                                    description:
                                        'Optional title for the strategy',
                                },
                                parameters: {
                                    type: 'object',
                                    example: {
                                        rollout: '10',
                                        stickiness: 'default',
                                    },
                                    description: 'Strategy parameters',
                                },
                                constraints: {
                                    type: 'array',
                                    description: 'Strategy constraints',
                                    items: {
                                        type: 'object',
                                    },
                                },
                                variants: {
                                    type: 'array',
                                    description: 'Strategy variants',
                                    items: {
                                        type: 'object',
                                    },
                                },
                                segments: {
                                    type: 'array',
                                    description: 'List of segment IDs',
                                    items: {
                                        type: 'integer',
                                        example: 1,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
} as const;

export type FeatureEnvironmentReleasePlanSchema = FromSchema<
    typeof featureEnvironmentReleasePlanSchema
>;
