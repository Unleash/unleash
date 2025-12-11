import type { FromSchema } from 'json-schema-to-ts';
import { releasePlanMilestoneSchema } from './release-plan-milestone-schema.js';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';
import { transitionConditionSchema } from './transition-condition-schema.js';

export const releasePlanTemplateSchema = {
    $id: '#/components/schemas/releasePlanTemplateSchema',
    additionalProperties: false,
    description: 'Schema representing the creation of a release template.',
    type: 'object',
    required: ['id', 'discriminator', 'name', 'createdByUserId', 'createdAt'],
    properties: {
        id: {
            type: 'string',
            description:
                "The release plan/template's ID. Release template IDs are ulids.",
            example: '01JB9GGTGQYEQ9D40R17T3YVW2',
            nullable: false,
        },
        discriminator: {
            type: 'string',
            description:
                'A field to distinguish between release plans and release templates.',
            example: 'template',
            nullable: false,
            enum: ['template'],
        },
        name: {
            type: 'string',
            description: 'The name of the release template.',
            example: 'My release plan',
        },
        description: {
            type: 'string',
            description: 'A description of the release template.',
            example: 'This is my release plan',
            nullable: true,
        },
        createdByUserId: {
            type: 'number',
            description:
                'Release template: The ID of the user who created this template.',
            example: 53,
            nullable: false,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description:
                'The date and time that the release template was created.',
            example: '2022-01-01T00:00:00Z',
            nullable: false,
        },
        milestones: {
            type: 'array',
            description: 'A list of the milestones in this release template.',
            items: {
                $ref: '#/components/schemas/releasePlanMilestoneSchema',
            },
        },
        archivedAt: {
            type: 'string',
            format: 'date-time',
            description:
                'The date and time that the release template was archived.',
            example: '2022-01-01T00:00:00Z',
            nullable: true,
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
        },
    },
} as const;

export type ReleasePlanTemplateSchema = FromSchema<
    typeof releasePlanTemplateSchema,
    { keepDefaultedPropertiesOptional: true }
>;
