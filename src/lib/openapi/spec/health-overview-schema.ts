import { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { featureSchema } from './feature-schema';
import { constraintSchema } from './constraint-schema';
import { environmentSchema } from './environment-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';
import { projectStatsSchema } from './project-stats-schema';
import { createFeatureStrategySchema } from './create-feature-strategy-schema';
import { projectEnvironmentSchema } from './project-environment-schema';

export const healthOverviewSchema = {
    $id: '#/components/schemas/healthOverviewSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'version',
        'name',
        'defaultStickiness',
        'mode',
        'members',
        'health',
        'environments',
        'features',
    ],
    description: `An overview of a project's stats and its health as described in the documentation on [technical debt](https://docs.getunleash.io/reference/technical-debt)`,
    properties: {
        version: {
            type: 'integer',
            description: 'The project overview version.',
            example: 1,
        },
        name: {
            type: 'string',
            description: `The project's name`,
            example: 'enterprisegrowth',
        },
        description: {
            type: 'string',
            nullable: true,
            description: `The project's description`,
            example: 'The project for all things enterprisegrowth',
        },
        defaultStickiness: {
            type: 'string',
            example: 'userId',
            description:
                'A default stickiness for the project affecting the default stickiness value for variants and Gradual Rollout strategy',
        },
        mode: {
            type: 'string',
            enum: ['open', 'protected'],
            example: 'open',
            description:
                "The project's [collaboration mode](https://docs.getunleash.io/reference/project-collaboration-mode). Determines whether non-project members can submit change requests or not.",
        },
        members: {
            type: 'integer',
            description: 'The number of users/members in the project.',
            example: 5,
            minimum: 0,
        },
        health: {
            type: 'integer',
            description:
                'The overall [health rating](https://docs.getunleash.io/reference/technical-debt#health-rating) of the project.',
            example: 95,
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectEnvironmentSchema',
            },
            description:
                'An array containing the names of all the environments configured for the project.',
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
            description:
                'An array containing an overview of all the features of the project and their individual status',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'When the project was last updated.',
            example: '2023-04-19T08:15:14.000Z',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'When the project was last updated.',
            example: '2023-04-19T08:15:14.000Z',
        },
        favorite: {
            type: 'boolean',
            description:
                'Indicates if the project has been marked as a favorite by the current user requesting the project health overview.',
            example: true,
        },
        stats: {
            $ref: '#/components/schemas/projectStatsSchema',
            description: 'Project statistics',
        },
    },
    components: {
        schemas: {
            environmentSchema,
            projectEnvironmentSchema,
            createFeatureStrategySchema,
            constraintSchema,
            featureSchema,
            featureEnvironmentSchema,
            overrideSchema,
            parametersSchema,
            featureStrategySchema,
            variantSchema,
            projectStatsSchema,
        },
    },
} as const;

export type HealthOverviewSchema = FromSchema<typeof healthOverviewSchema>;
