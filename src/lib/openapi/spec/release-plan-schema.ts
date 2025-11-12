import type { FromSchema } from 'json-schema-to-ts';
import { releasePlanMilestoneSchema } from './release-plan-milestone-schema.js';
import { releasePlanTemplateSchema } from './release-plan-template-schema.js';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { transitionConditionSchema } from './transition-condition-schema.js';
import { safeguardSchema } from './safeguard-schema.js';

export const releasePlanSchema = {
    $id: '#/components/schemas/releasePlanSchema',
    additionalProperties: false,
    description: 'Schema representing the creation of a release plan.',
    type: 'object',
    required: [
        'id',
        'discriminator',
        'name',
        'featureName',
        'environment',
        'createdByUserId',
        'createdAt',
        'milestones',
        'releasePlanTemplateId',
    ],
    properties: {
        id: releasePlanTemplateSchema.properties.id,
        discriminator: {
            type: 'string',
            description:
                'A field to distinguish between release plans and release templates.',
            example: 'plan',
            nullable: false,
            enum: ['plan'],
        },
        name: releasePlanTemplateSchema.properties.name,
        description: releasePlanTemplateSchema.properties.description,
        featureName: {
            type: 'string',
            description: 'The name of the feature that uses this release plan.',
            example: 'my-feature',
        },
        environment: {
            type: 'string',
            description: 'The environment that this release plan is for.',
            example: 'production',
        },
        createdByUserId: releasePlanTemplateSchema.properties.createdByUserId,
        createdAt: releasePlanTemplateSchema.properties.createdAt,
        activeMilestoneId: {
            type: 'string',
            description:
                'The ID of the currently active milestone in this release plan.',
            example: '01JB9GGTGQYEQ9D40R17T3YVW1',
            nullable: true,
        },
        milestones: releasePlanTemplateSchema.properties.milestones,
        releasePlanTemplateId: {
            type: 'string',
            description:
                'The ID of the release plan template that this release plan is based on.',
            example: '01JB9GGTGQYEQ9D40R17T3YVW2',
            nullable: false,
        },
        safeguards: {
            type: 'array',
            description: 'An array of safeguards configured for this release plan.',
            items: {
                $ref: '#/components/schemas/safeguardSchema',
            },
        },
    },
    components: {
        schemas: {
            releasePlanMilestoneSchema,
            releasePlanMilestoneStrategySchema,
            createFeatureStrategySchema,
            parametersSchema,
            constraintSchema,
            createStrategyVariantSchema,
            transitionConditionSchema,
            safeguardSchema,
        },
    },
} as const;

export type ReleasePlanSchema = FromSchema<typeof releasePlanSchema>;
