import type { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { variantSchema } from './variant-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';
import { releasePlanSchema } from './release-plan-schema.js';
import { releasePlanMilestoneSchema } from './release-plan-milestone-schema.js';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';
import { transitionConditionSchema } from './transition-condition-schema.js';

export const featureEnvironmentSchema = {
    $id: '#/components/schemas/featureEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'enabled'],
    description: 'A detailed description of the feature environment',
    properties: {
        name: {
            type: 'string',
            example: 'my-dev-env',
            description: 'The name of the environment',
        },
        featureName: {
            type: 'string',
            example: 'disable-comments',
            description: 'The name of the feature',
        },
        environment: {
            type: 'string',
            example: 'development',
            description: 'The name of the environment',
        },
        type: {
            type: 'string',
            example: 'development',
            description: 'The type of the environment',
        },
        enabled: {
            type: 'boolean',
            example: true,
            description:
                '`true` if the feature is enabled for the environment, otherwise `false`.',
        },
        sortOrder: {
            type: 'number',
            example: 3,
            description:
                'The sort order of the feature environment in the feature environments list',
        },
        variantCount: {
            type: 'number',
            description: 'The number of defined variants',
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
            description:
                'A list of activation strategies for the feature environment',
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
            description: 'A list of variants for the feature environment',
        },
        changeRequestIds: {
            type: 'array',
            items: {
                type: 'number',
            },
            description:
                'Experimental. A list of change request identifiers for actionable change requests that are not Cancelled, Rejected or Approved.',
        },
        milestoneName: {
            type: 'string',
            example: 'Phase One',
            description:
                'Experimental: The name of the currently active release plan milestone',
        },
        milestoneOrder: {
            type: 'number',
            example: 0,
            description:
                'Experimental: The zero-indexed order of currently active milestone in the list of all release plan milestones',
        },
        totalMilestones: {
            type: 'number',
            example: 0,
            description:
                'Experimental: The total number of milestones in the feature environment release plan',
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-01-28T16:21:39.975Z',
            description:
                'The date when metrics where last collected for the feature environment',
        },
        hasStrategies: {
            type: 'boolean',
            description: 'Whether the feature has any strategies defined.',
        },
        hasEnabledStrategies: {
            type: 'boolean',
            description:
                'Whether the feature has any enabled strategies defined.',
        },
        releasePlans: {
            type: 'array',
            description:
                'Release plans for this feature environment (only available when milestoneProgression feature flag is enabled)',
            items: {
                $ref: '#/components/schemas/releasePlanSchema',
            },
        },
        yes: {
            type: 'integer',
            description: 'How many times the feature evaluated to true (enabled)',
            example: 974,
            minimum: 0,
        },
        no: {
            type: 'integer',
            description: 'How many times the feature evaluated to false (disabled)',
            example: 50,
            minimum: 0,
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
            featureStrategySchema,
            strategyVariantSchema,
            variantSchema,
            releasePlanSchema,
            releasePlanMilestoneSchema,
            releasePlanMilestoneStrategySchema,
            createFeatureStrategySchema,
            createStrategyVariantSchema,
            transitionConditionSchema,
        },
    },
} as const;

export type FeatureEnvironmentSchema = FromSchema<
    typeof featureEnvironmentSchema
>;
