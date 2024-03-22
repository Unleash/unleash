import type { FromSchema } from 'json-schema-to-ts';
import { projectStatsSchema } from './project-stats-schema';
import { featureTypeCountSchema } from './feature-type-count-schema';
import { doraFeaturesSchema } from './dora-features-schema';
import { projectDoraMetricsSchema } from './project-dora-metrics-schema';

export const projectInsightsSchema = {
    $id: '#/components/schemas/projectInsightsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['stats', 'leadTime', 'featureTypeCounts', 'health', 'members'],
    description:
        'A high-level overview of a project insights. It contains information such as project statistics, overall health, types of flags, members overview, change requests overview.',
    properties: {
        stats: {
            $ref: '#/components/schemas/projectStatsSchema',
            description: 'Project statistics',
        },
        health: {
            type: 'object',
            required: [
                'rating',
                'activeCount',
                'potentiallyStaleCount',
                'staleCount',
            ],
            properties: {
                rating: {
                    type: 'integer',
                    description:
                        "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#health-rating) on a scale from 0 to 100",
                    example: 95,
                },
                activeCount: {
                    type: 'number',
                    description: 'The number of active feature toggles.',
                    example: 12,
                },
                potentiallyStaleCount: {
                    type: 'number',
                    description:
                        'The number of potentially stale feature toggles.',
                    example: 5,
                },
                staleCount: {
                    type: 'number',
                    description: 'The number of stale feature toggles.',
                    example: 10,
                },
            },
            description: 'Health summary of the project',
        },
        leadTime: {
            type: 'object',
            $ref: '#/components/schemas/projectDoraMetricsSchema',
            description: 'Lead time (DORA) metrics',
        },
        featureTypeCounts: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureTypeCountSchema',
            },
            description: 'The number of features of each type',
        },
        members: {
            type: 'object',
            required: ['currentMembers', 'change'],
            properties: {
                currentMembers: {
                    type: 'number',
                    description: 'The number of total project members',
                    example: 10,
                },
                change: {
                    type: 'number',
                    description:
                        'The change in the number of project members compared to the previous month',
                    example: 10,
                },
            },
            description: 'Active/inactive users summary',
        },
        changeRequests: {
            type: 'object',
            required: [
                'total',
                'applied',
                'rejected',
                'reviewRequired',
                'approved',
                'scheduled',
            ],
            properties: {
                total: {
                    type: 'number',
                    description:
                        'The number of total change requests in this project',
                    example: 10,
                },
                applied: {
                    type: 'number',
                    description: 'The number of applied change requests',
                    example: 5,
                },
                rejected: {
                    type: 'number',
                    description: 'The number of rejected change requests',
                    example: 2,
                },
                reviewRequired: {
                    type: 'number',
                    description:
                        'The number of change requests awaiting the review',
                    example: 2,
                },
                approved: {
                    type: 'number',
                    description: 'The number of approved change requests',
                    example: 1,
                },
                scheduled: {
                    type: 'number',
                    description: 'The number of scheduled change requests',
                    example: 1,
                },
            },
            description:
                'Count of change requests in different stages of the [process](https://docs.getunleash.io/reference/change-requests#change-request-flow). Only for enterprise users.',
        },
    },
    components: {
        schemas: {
            projectStatsSchema,
            featureTypeCountSchema,
            projectDoraMetricsSchema,
            doraFeaturesSchema,
        },
    },
} as const;

export type ProjectInsightsSchema = FromSchema<typeof projectInsightsSchema>;
