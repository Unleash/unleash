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

export const projectOverviewSchema = {
    $id: '#/components/schemas/projectOverviewSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'name'],
    description:
        'A high-level overview of a project. It contains information such as project statistics, the name of the project, what members and what features it contains, etc.',
    properties: {
        stats: {
            $ref: '#/components/schemas/projectStatsSchema',
            description: 'Project statistics',
        },
        version: {
            type: 'number',
            example: 1,
        },
        name: {
            type: 'string',
            example: 'dx-squad',
            description: 'The name of this project',
        },
        description: {
            type: 'string',
            nullable: true,
            example: 'DX squad feature release',
            description: 'Additional information about the project',
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
            type: 'number',
            example: 4,
            description: 'The number of members this project has',
        },
        health: {
            type: 'number',
            example: 50,
            description:
                "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#health-rating) on a scale from 0 to 100",
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectEnvironmentSchema',
            },
            example: [
                { environment: 'development' },
                {
                    environment: 'production',
                    defaultStrategy: {
                        name: 'flexibleRollout',
                        constraints: [],
                        parameters: {
                            rollout: '50',
                            stickiness: 'customAppName',
                            groupId: 'stickytoggle',
                        },
                    },
                },
            ],
            description: 'The environments that are enabled for this project',
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
            description:
                'The full list of features in this project (excluding archived features)',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-02-10T08:36:35.262Z',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-02-10T08:36:35.262Z',
        },
        favorite: {
            type: 'boolean',
            example: true,
            description:
                '`true` if the project was favorited, otherwise `false`.',
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

export type ProjectOverviewSchema = FromSchema<typeof projectOverviewSchema>;
