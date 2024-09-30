import type { FromSchema } from 'json-schema-to-ts';
import { projectSchema } from './project-schema';
import { projectOverviewSchema } from './project-overview-schema';

export const personalDashboardProjectDetailsSchema = {
    $id: '#/components/schemas/personalDashboardProjectDetailsSchema',
    type: 'object',
    description: 'Project details in personal dashboard',
    additionalProperties: false,
    required: ['owners', 'roles', 'latestEvents', 'onboardingStatus'],
    properties: {
        onboardingStatus: projectOverviewSchema.properties.onboardingStatus,
        latestEvents: {
            type: 'array',
            description: 'The latest events for the project.',
            items: {
                type: 'object',
                description: 'An event summary',
                additionalProperties: false,
                required: ['summary', 'createdBy'],
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
