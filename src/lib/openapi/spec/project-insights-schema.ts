import type { FromSchema } from 'json-schema-to-ts';
import { projectStatsSchema } from './project-stats-schema.js';
import { featureTypeCountSchema } from './feature-type-count-schema.js';
import { doraFeaturesSchema } from './dora-features-schema.js';
import { projectDoraMetricsSchema } from './project-dora-metrics-schema.js';

export const projectInsightsSchema = {
    $id: '#/components/schemas/projectInsightsSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'stats',
        'leadTime',
        'featureTypeCounts',
        'health',
        'technicalDebt',
        'members',
    ],
    description:
        'A high-level overview of a project insights. It contains information such as project statistics, overall health, types of flags, members overview, change requests overview.',
    properties: {
        stats: {
            $ref: '#/components/schemas/projectStatsSchema',
            description: 'Project statistics',
        },
        health: {
            type: 'object',
            deprecated: true,
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
                        "An indicator of the [project's technical debt](https://docs.getunleash.io/concepts/technical-debt#project-status) on a scale from 0 to 100",
                    example: 95,
                },
                activeCount: {
                    type: 'number',
                    description: 'The number of active feature flags.',
                    example: 12,
                },
                potentiallyStaleCount: {
                    type: 'number',
                    description:
                        'The number of potentially stale feature flags.',
                    example: 5,
                },
                staleCount: {
                    type: 'number',
                    description: 'The number of stale feature flags.',
                    example: 10,
                },
            },
            description:
                'Use `technicalDebt` instead. Summary of the project health',
        },
        technicalDebt: {
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
                        "An indicator of the [project's technical debt](https://docs.getunleash.io/concepts/technical-debt#project-status) on a scale from 0 to 100",
                    example: 25,
                    minimum: 0,
                    maximum: 100,
                },
                activeCount: {
                    type: 'number',
                    description: 'The number of active feature flags.',
                    example: 12,
                },
                potentiallyStaleCount: {
                    type: 'number',
                    description:
                        'The number of potentially stale feature flags.',
                    example: 5,
                },
                staleCount: {
                    type: 'number',
                    description: 'The number of stale feature flags.',
                    example: 10,
                },
            },
            description: 'Summary of the projects technical debt',
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
