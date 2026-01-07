import type { FromSchema } from 'json-schema-to-ts';
import { projectSchema } from './project-schema.js';
import { projectOverviewSchema } from './project-overview-schema.js';

export const personalDashboardProjectDetailsSchema = {
    $id: '#/components/schemas/personalDashboardProjectDetailsSchema',
    type: 'object',
    description: 'Project details in personal dashboard',
    additionalProperties: false,
    required: [
        'owners',
        'roles',
        'latestEvents',
        'onboardingStatus',
        'insights',
    ],
    properties: {
        insights: {
            type: 'object',
            description:
                'Insights for the project, including flag data and project health information.',
            additionalProperties: false,
            required: [
                'avgHealthCurrentWindow',
                'avgHealthPastWindow',
                'totalFlags',
                'activeFlags',
                'staleFlags',
                'potentiallyStaleFlags',
                'health',
                'technicalDebt',
            ],
            properties: {
                avgHealthCurrentWindow: {
                    type: 'integer',
                    minimum: 0,
                    description:
                        "The project's average health score over the last 4 weeks",
                    example: 80,
                    nullable: true,
                },
                avgHealthPastWindow: {
                    type: 'integer',
                    minimum: 0,
                    description:
                        "The project's average health score over the previous 4-week window",
                    example: 70,
                    nullable: true,
                },
                totalFlags: {
                    type: 'integer',
                    minimum: 0,
                    example: 100,
                    description: 'The current number of non-archived flags',
                },
                activeFlags: {
                    type: 'integer',
                    minimum: 0,
                    example: 98,
                    description:
                        'The number of active flags that are not stale or potentially stale',
                },
                staleFlags: {
                    type: 'integer',
                    minimum: 0,
                    example: 0,
                    description:
                        'The current number of flags that have been manually marked as stale',
                },
                potentiallyStaleFlags: {
                    type: 'integer',
                    minimum: 0,
                    example: 2,
                    description:
                        'The number of potentially stale flags as calculated by Unleash',
                },
                health: {
                    type: 'integer',
                    minimum: 0,
                    description: 'Use `technicalDebt` instead.',
                    example: 80,
                    deprecated: true,
                },
                technicalDebt: {
                    type: 'integer',
                    example: 25,
                    minimum: 0,
                    maximum: 100,
                    description:
                        "An indicator of the [project's technical debt](https://docs.getunleash.io/concepts/technical-debt#project-status) on a scale from 0 to 100",
                },
            },
        },
        onboardingStatus: projectOverviewSchema.properties.onboardingStatus,
        latestEvents: {
            type: 'array',
            description: 'The latest events for the project.',
            items: {
                type: 'object',
                description: 'An event summary',
                additionalProperties: false,
                required: [
                    'summary',
                    'createdBy',
                    'createdByImageUrl',
                    'id',
                    'createdAt',
                ],
                properties: {
                    id: {
                        type: 'integer',
                        minimum: 1,
                        description: 'The ID of the event.',
                    },
                    summary: {
                        type: 'string',
                        nullable: true,
                        description:
                            '**[Experimental]** A markdown-formatted summary of the event.',
                    },
                    createdBy: {
                        type: 'string',
                        description: 'Which user created this event',
                        example: 'johndoe',
                    },
                    createdByImageUrl: {
                        type: 'string',
                        description: `URL used for the user profile image of the event author`,
                        example: 'https://example.com/242x200.png',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'When the event was recorded',
                        example: '2021-09-01T12:00:00Z',
                    },
                },
            },
        },
        owners: projectSchema.properties.owners,
        roles: {
            type: 'array',
            description: 'The list of roles that the user has in this project.',
            items: {
                type: 'object',
                description: 'An Unleash role.',
                additionalProperties: false,
                required: ['name', 'id', 'type'],
                properties: {
                    name: {
                        type: 'string',
                        example: 'Owner',
                        description: 'The name of the role',
                    },
                    id: {
                        type: 'integer',
                        example: 4,
                        description: 'The id of the role',
                    },
                    type: {
                        type: 'string',
                        enum: ['custom', 'project'],
                        example: 'project',
                        description: 'The type of the role',
                    },
                },
            },
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type PersonalDashboardProjectDetailsSchema = FromSchema<
    typeof personalDashboardProjectDetailsSchema
>;
