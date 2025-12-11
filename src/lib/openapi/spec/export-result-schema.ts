import type { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { featureEnvironmentSchema } from './feature-environment-schema.js';
import { contextFieldSchema } from './context-field-schema.js';
import { featureTagSchema } from './feature-tag-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { legalValueSchema } from './legal-value-schema.js';
import { variantSchema } from './variant-schema.js';
import { overrideSchema } from './override-schema.js';
import { variantsSchema } from './variants-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { tagTypeSchema } from './tag-type-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { featureDependenciesSchema } from './feature-dependencies-schema.js';
import { releasePlanSchema } from './release-plan-schema.js';
import { releasePlanMilestoneSchema } from './release-plan-milestone-schema.js';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';
import { transitionConditionSchema } from './transition-condition-schema.js';
import { dependentFeatureSchema } from './dependent-feature-schema.js';
import { tagSchema } from './tag-schema.js';
import { featureLinksSchema } from './feature-links-schema.js';
import { featureLinkSchema } from './feature-link-schema.js';
import { safeguardSchema } from './safeguard-schema.js';
import { metricQuerySchema } from './metric-query-schema.js';
import { safeguardTriggerConditionSchema } from './safeguard-trigger-condition-schema.js';

export const exportResultSchema = {
    $id: '#/components/schemas/exportResultSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'The result of the export operation, providing you with the feature flag definitions, strategy definitions and the rest of the elements relevant to the features (tags, environments etc.)',
    required: ['features', 'featureStrategies', 'tagTypes'],
    properties: {
        features: {
            type: 'array',
            description: 'All the exported features.',
            example: [
                {
                    name: 'my-feature',
                    description: 'best feature ever',
                    type: 'release',
                    project: 'default',
                    stale: false,
                    impressionData: false,
                    archived: false,
                },
            ],
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
        },
        featureStrategies: {
            type: 'array',
            description:
                'All strategy instances that are used by the exported features in the `features` list.',
            example: [
                {
                    name: 'flexibleRollout',
                    id: '924974d7-8003-43ee-87eb-c5f887c06fd1',
                    featureName: 'my-feature',
                    title: 'Rollout 50%',
                    parameters: {
                        groupId: 'default',
                        rollout: '50',
                        stickiness: 'random',
                    },
                    constraints: [],
                    disabled: false,
                    segments: [1],
                },
            ],
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
        featureEnvironments: {
            type: 'array',
            description:
                'Environment-specific configuration for all the features in the `features` list. Includes data such as whether the feature is enabled in the selected export environment, whether there are any variants assigned, etc.',
            example: [
                {
                    enabled: true,
                    featureName: 'my-feature',
                    environment: 'development',
                    variants: [
                        {
                            name: 'a',
                            weight: 500,
                            overrides: [],
                            stickiness: 'random',
                            weightType: 'variable',
                        },
                        {
                            name: 'b',
                            weight: 500,
                            overrides: [],
                            stickiness: 'random',
                            weightType: 'variable',
                        },
                    ],
                    name: 'variant-testing',
                },
            ],
            items: {
                $ref: '#/components/schemas/featureEnvironmentSchema',
            },
        },
        contextFields: {
            type: 'array',
            description:
                'A list of all the context fields that are in use by any of the strategies in the `featureStrategies` list.',
            example: [
                {
                    name: 'appName',
                    description: 'Allows you to constrain on application name',
                    stickiness: false,
                    sortOrder: 2,
                    legalValues: [],
                },
            ],
            items: {
                $ref: '#/components/schemas/contextFieldSchema',
            },
        },
        featureTags: {
            type: 'array',
            description:
                'A list of all the tags that have been applied to any of the features in the `features` list.',
            example: [
                {
                    featureName: 'my-feature',
                    tagType: 'simple',
                    tagValue: 'user-facing',
                },
            ],
            items: {
                $ref: '#/components/schemas/featureTagSchema',
            },
        },
        segments: {
            type: 'array',
            description:
                'A list of all the segments that are used by the strategies in the `featureStrategies` list.',
            example: [
                {
                    id: 1,
                    name: 'new-segment-name',
                },
            ],
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'name'],
                properties: {
                    id: {
                        type: 'number',
                    },
                    name: {
                        type: 'string',
                    },
                },
            },
        },
        tagTypes: {
            type: 'array',
            description:
                'A list of all of the tag types that are used in the `featureTags` list.',
            example: [
                {
                    name: 'simple',
                    description: 'Used to simplify filtering of features',
                    icon: '#',
                },
            ],
            items: {
                $ref: '#/components/schemas/tagTypeSchema',
            },
        },
        dependencies: {
            type: 'array',
            description:
                'A list of all the dependencies for features in `features` list.',
            items: {
                $ref: '#/components/schemas/featureDependenciesSchema',
            },
        },
        links: {
            type: 'array',
            description: 'A list of links for features in `features` list.',
            items: {
                $ref: '#/components/schemas/featureLinksSchema',
            },
        },
    },
    components: {
        schemas: {
            featureSchema,
            featureStrategySchema,
            strategyVariantSchema,
            featureEnvironmentSchema,
            contextFieldSchema,
            featureTagSchema,
            variantsSchema,
            variantSchema,
            overrideSchema,
            constraintSchema,
            parametersSchema,
            legalValueSchema,
            tagTypeSchema,
            featureDependenciesSchema,
            dependentFeatureSchema,
            tagSchema,
            featureLinksSchema,
            featureLinkSchema,
            releasePlanSchema,
            releasePlanMilestoneSchema,
            releasePlanMilestoneStrategySchema,
            createFeatureStrategySchema,
            createStrategyVariantSchema,
            transitionConditionSchema,
            safeguardSchema,
            metricQuerySchema,
            safeguardTriggerConditionSchema,
        },
    },
} as const;

export type ExportResultSchema = FromSchema<
    typeof exportResultSchema,
    { keepDefaultedPropertiesOptional: true }
>;
