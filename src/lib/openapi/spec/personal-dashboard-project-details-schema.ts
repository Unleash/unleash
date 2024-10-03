import type { FromSchema } from 'json-schema-to-ts';
import { projectSchema } from './project-schema';
import { projectOverviewSchema } from './project-overview-schema';

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
            description: 'Insights for the project',
            additionalProperties: false,
            required: [
                'avgHealthCurrentWindow',
                'avgHealthPastWindow',
                'totalFlags',
                'activeFlags',
                'staleFlags',
                'potentiallyStaleFlags',
                'health',
            ],
            properties: {
                avgHealthCurrentWindow: {
                    type: 'number',
                    description:
                        'The average health score in the current window of the last 4 weeks',
                    example: 80,
                    nullable: true,
                },
                avgHealthPastWindow: {
                    type: 'number',
                    description:
                        'The average health score in the previous 4 weeks before the current window',
                    example: 70,
                    nullable: true,
                },
                totalFlags: {
                    type: 'number',
                    example: 100,
                    description: 'The current number of all flags',
                },
                activeFlags: {
                    type: 'number',
                    example: 98,
                    description: 'The current number of active flags',
                },
                staleFlags: {
                    type: 'number',
                    example: 0,
                    description:
                        'The current number of user marked stale flags',
                },
                potentiallyStaleFlags: {
                    type: 'number',
                    example: 2,
                    description:
                        'The current number of time calculated potentially stale flags',
                },
                health: {
                    type: 'number',
                    description: 'The current health score of the project',
                    example: 80,
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
                required: ['summary', 'createdBy', 'createdByImageUrl', 'id'],
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
                },
            },
        },
        owners: projectSchema.properties.owners,
        roles: {
            type: 'array',
            description: 'The list of roles that the user has in this project.',
            minItems: 1,
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
                        enum: ['custom', 'project', 'root', 'custom-root'],
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
