import type { FromSchema } from 'json-schema-to-ts';
import { projectActivitySchema } from './project-activity-schema';

const stageDataWithAverageDaysSchema = {
    type: 'object',
    additionalProperties: false,
    description:
        'Statistics on feature flags in a given stage in this project.',
    required: ['averageDays', 'currentFlags'],
    properties: {
        averageDays: {
            type: 'number',
            nullable: true,
            description:
                "The average number of days a feature flag remains in a stage in this project. Will be null if Unleash doesn't have any data for this stage yet.",
            example: 5,
        },
        currentFlags: {
            type: 'integer',
            description:
                'The number of feature flags currently in a stage in this project.',
            example: 10,
        },
    },
} as const;

export const projectStatusSchema = {
    $id: '#/components/schemas/projectStatusSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'activityCountByDate',
        'resources',
        'averageHealth',
        'lifecycleSummary',
    ],
    description:
        'Schema representing the overall status of a project, including an array of activity records. Each record in the activity array contains a date and a count, providing a snapshot of the project’s activity level over time.',
    properties: {
        activityCountByDate: {
            $ref: '#/components/schemas/projectActivitySchema',
            description:
                'Array of activity records with date and count, representing the project’s daily activity statistics.',
        },
        averageHealth: {
            type: 'integer',
            minimum: 0,
            description:
                'The average health score over the last 4 weeks, indicating whether features are stale or active.',
        },
        resources: {
            type: 'object',
            additionalProperties: false,
            required: [
                'connectedEnvironments',
                'apiTokens',
                'members',
                'segments',
            ],
            description: 'Key resources within the project',
            properties: {
                connectedEnvironments: {
                    type: 'integer',
                    minimum: 0,
                    description:
                        'The number of environments that have received SDK traffic in this project.',
                },
                apiTokens: {
                    type: 'integer',
                    minimum: 0,
                    description:
                        'The number of API tokens created specifically for this project.',
                },
                members: {
                    type: 'integer',
                    minimum: 0,
                    description:
                        'The number of users who have been granted roles in this project. Does not include users who have access via groups.',
                },
                segments: {
                    type: 'integer',
                    minimum: 0,
                    description:
                        'The number of segments that are scoped to this project.',
                },
            },
        },
        lifecycleSummary: {
            type: 'object',
            additionalProperties: false,
            description: 'Feature flag lifecycle statistics for this project.',
            required: ['initial', 'preLive', 'live', 'completed', 'archived'],
            properties: {
                initial: stageDataWithAverageDaysSchema,
                preLive: stageDataWithAverageDaysSchema,
                live: stageDataWithAverageDaysSchema,
                completed: stageDataWithAverageDaysSchema,
                archived: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['currentFlags', 'last30Days'],
                    description:
                        'Information on archived flags in this project.',
                    properties: {
                        currentFlags: {
                            type: 'integer',
                            description:
                                'The number of archived feature flags in this project. If a flag is deleted permanently, it will no longer be counted as part of this statistic.',
                            example: 10,
                        },
                        last30Days: {
                            type: 'integer',
                            description:
                                'The number of flags in this project that have been changed over the last 30 days.',
                            example: 5,
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            projectActivitySchema,
        },
    },
} as const;

export type ProjectStatusSchema = FromSchema<typeof projectStatusSchema>;
