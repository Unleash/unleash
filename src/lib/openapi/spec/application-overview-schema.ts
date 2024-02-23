import { FromSchema } from 'json-schema-to-ts';
import { applicationOverviewEnvironmentSchema } from './application-overview-environment-schema';

export const applicationOverviewSchema = {
    $id: '#/components/schemas/applicationOverviewSchema',
    type: 'object',
    description:
        "Data about an application that's connected to Unleash via an SDK.",
    additionalProperties: false,
    required: ['projects', 'featureCount', 'environments'],
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
    },
    components: {
        schemas: {
            applicationOverviewEnvironmentSchema,
        },
    },
} as const;

export type ApplicationOverviewSchema = FromSchema<
    typeof applicationOverviewSchema
>;
