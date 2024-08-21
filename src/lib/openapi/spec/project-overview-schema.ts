import type { FromSchema } from 'json-schema-to-ts';
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
import { createStrategyVariantSchema } from './create-strategy-variant-schema';
import { strategyVariantSchema } from './strategy-variant-schema';
import { createFeatureNamingPatternSchema } from './create-feature-naming-pattern-schema';
import { featureTypeCountSchema } from './feature-type-count-schema';

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
            type: 'integer',
            example: 1,
            description:
                'The schema version used to describe the project overview',
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
            enum: ['open', 'protected', 'private'],
            example: 'open',
            description:
                "The project's [collaboration mode](https://docs.getunleash.io/reference/project-collaboration-mode). Determines whether non-project members can submit change requests or not.",
        },
        featureLimit: {
            type: 'number',
            nullable: true,
            example: 100,
            description:
                'A limit on the number of features allowed in the project. Null if no limit.',
        },
        featureNaming: {
            $ref: '#/components/schemas/createFeatureNamingPatternSchema',
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
                            groupId: 'stickyFlag',
                        },
                    },
                },
            ],
            description: 'The environments that are enabled for this project',
        },
        featureTypeCounts: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureTypeCountSchema',
            },
            description:
                'The number of features of each type that are in this project',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-02-10T08:36:35.262Z',
            description: 'When the project was last updated.',
        },
        archivedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-02-10T08:36:35.262Z',
            description: 'When the project was archived.',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-02-10T08:36:35.262Z',
            description: 'When the project was created.',
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
            createStrategyVariantSchema,
            constraintSchema,
            featureSchema,
            featureEnvironmentSchema,
            overrideSchema,
            parametersSchema,
            featureStrategySchema,
            strategyVariantSchema,
            variantSchema,
            projectStatsSchema,
            createFeatureNamingPatternSchema,
            featureTypeCountSchema,
        },
    },
} as const;

export type ProjectOverviewSchema = FromSchema<typeof projectOverviewSchema>;
