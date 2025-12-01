import type { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema.js';
import { variantSchema } from './variant-schema.js';
import { overrideSchema } from './override-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { featureSchema } from './feature-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { environmentSchema } from './environment-schema.js';
import { featureEnvironmentSchema } from './feature-environment-schema.js';
import { projectStatsSchema } from './project-stats-schema.js';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { projectEnvironmentSchema } from './project-environment-schema.js';
import { releasePlanSchema } from './release-plan-schema.js';
import { releasePlanMilestoneSchema } from './release-plan-milestone-schema.js';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { transitionConditionSchema } from './transition-condition-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { createFeatureNamingPatternSchema } from './create-feature-naming-pattern-schema.js';
import { tagSchema } from './tag-schema.js';

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
        'technicalDebt',
        'environments',
        'features',
    ],
    description: `An overview of a project's stats and its health as described in the documentation on [technical debt](https://docs.getunleash.io/concepts/technical-debt)`,
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
            enum: ['open', 'protected', 'private'],
            example: 'open',
            description:
                "The project's [collaboration mode](https://docs.getunleash.io/concepts/project-collaboration-mode). Determines whether non-project members can submit change requests or not.",
        },
        featureLimit: {
            type: 'number',
            nullable: true,
            example: 100,
            description:
                'A limit on the number of features allowed in the project. Null if no limit.',
        },
        members: {
            type: 'integer',
            description: 'The number of users/members in the project.',
            example: 5,
            minimum: 0,
        },
        health: {
            type: 'integer',
            description: 'Use `technicalDebt` instead.',
            example: 95,
            deprecated: true,
        },
        technicalDebt: {
            type: 'number',
            example: 25,
            minimum: 0,
            maximum: 100,
            description:
                "An indicator of the [project's technical debt](https://docs.getunleash.io/concepts/technical-debt#project-status) on a scale from 0 to 100",
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
        featureNaming: {
            $ref: '#/components/schemas/createFeatureNamingPatternSchema',
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
            releasePlanSchema,
            releasePlanMilestoneSchema,
            releasePlanMilestoneStrategySchema,
            transitionConditionSchema,
            strategyVariantSchema,
            variantSchema,
            projectStatsSchema,
            createFeatureNamingPatternSchema,
            tagSchema,
        },
    },
} as const;

export type HealthOverviewSchema = FromSchema<typeof healthOverviewSchema>;
