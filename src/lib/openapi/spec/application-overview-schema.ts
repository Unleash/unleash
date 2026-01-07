import type { FromSchema } from 'json-schema-to-ts';
import { applicationOverviewEnvironmentSchema } from './application-overview-environment-schema.js';
import { applicationOverviewIssuesSchema } from './application-overview-issues-schema.js';
import { applicationEnvironmentIssuesSchema } from './application-environment-issues-schema.js';

export const applicationOverviewSchema = {
    $id: '#/components/schemas/applicationOverviewSchema',
    type: 'object',
    description:
        "Data about an application that's connected to Unleash via an SDK.",
    additionalProperties: false,
    required: ['projects', 'featureCount', 'environments', 'issues'],
    properties: {
        projects: {
            description: 'The list of projects the application has been using.',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['default', 'payment'],
        },
        featureCount: {
            description:
                'The number of features the application has been using.',
            type: 'number',
            example: 5,
        },
        environments: {
            type: 'array',
            description:
                'The list of environments the application has been using.',
            items: {
                $ref: '#/components/schemas/applicationOverviewEnvironmentSchema',
            },
        },
        issues: {
            description:
                'This list of issues that might be wrong with the application',
            $ref: '#/components/schemas/applicationOverviewIssuesSchema',
        },
    },
    components: {
        schemas: {
            applicationOverviewEnvironmentSchema,
            applicationOverviewIssuesSchema,
            applicationEnvironmentIssuesSchema,
        },
    },
} as const;

export type ApplicationOverviewSchema = FromSchema<
    typeof applicationOverviewSchema
>;
