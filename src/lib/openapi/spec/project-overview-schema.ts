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
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { createFeatureNamingPatternSchema } from './create-feature-naming-pattern-schema.js';
import { featureTypeCountSchema } from './feature-type-count-schema.js';
import { projectLinkTemplateSchema } from './project-link-template-schema.js';
import { releasePlanSchema } from './release-plan-schema.js';
import { releasePlanMilestoneSchema } from './release-plan-milestone-schema.js';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { transitionConditionSchema } from './transition-condition-schema.js';

export const projectOverviewSchema = {
    $id: '#/components/schemas/projectOverviewSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'name', 'onboardingStatus'],
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
                "The project's [collaboration mode](https://docs.getunleash.io/concepts/project-collaboration-mode). Determines whether non-project members can submit change requests or not.",
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
        linkTemplates: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectLinkTemplateSchema',
            },
            description:
                'A list of templates for links that will be automatically added to new feature flags.',
        },
        members: {
            type: 'number',
            example: 4,
            description: 'The number of members this project has',
        },
        health: {
            type: 'number',
            example: 50,
            deprecated: true,
            description: 'Use `technicalDebt` instead.',
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
        onboardingStatus: {
            type: 'object',
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['onboarding-started', 'onboarded'],
                            example: 'onboarding-started',
                        },
                    },
                    required: ['status'],
                    additionalProperties: false,
                },
                {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['first-flag-created'],
                            example: 'first-flag-created',
                        },
                        feature: {
                            type: 'string',
                            description: 'The name of the feature flag',
                            example: 'my-feature-flag',
                        },
                    },
                    required: ['status', 'feature'],
                    additionalProperties: false,
                },
            ],
            description: 'The current onboarding status of the project.',
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
            releasePlanSchema,
            releasePlanMilestoneSchema,
            releasePlanMilestoneStrategySchema,
            transitionConditionSchema,
            projectStatsSchema,
            createFeatureNamingPatternSchema,
            featureTypeCountSchema,
            projectLinkTemplateSchema,
        },
    },
} as const;

export type ProjectOverviewSchema = FromSchema<
    typeof projectOverviewSchema,
    { keepDefaultedPropertiesOptional: true }
>;
