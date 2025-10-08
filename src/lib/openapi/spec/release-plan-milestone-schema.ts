import type { FromSchema } from 'json-schema-to-ts';
import { releasePlanMilestoneStrategySchema } from './release-plan-milestone-strategy-schema.js';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';

export const releasePlanMilestoneSchema = {
    $id: '#/components/schemas/releasePlanMilestoneSchema',
    additionalProperties: false,
    description:
        'Schema representing the creation of a release plan milestone.',
    type: 'object',
    required: ['id', 'name', 'sortOrder', 'releasePlanDefinitionId'],
    properties: {
        id: {
            type: 'string',
            description: "The milestone's ID. Milestone IDs are ulids.",
            example: '01JB9GGTGQYEQ9D40R17T3YVW1',
            nullable: false,
        },
        name: {
            type: 'string',
            description: 'The name of the milestone.',
            example: 'My milestone',
        },
        sortOrder: {
            type: 'integer',
            description: 'The order of the milestone in the release plan.',
            example: 1,
        },
        releasePlanDefinitionId: {
            type: 'string',
            description:
                'The ID of the release plan/template that this milestone belongs to.',
            example: '01JB9GGTGQYEQ9D40R17T3YVW2',
        },
        startedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time when the milestone was started.',
            example: '2024-01-01T00:00:00.000Z',
            nullable: true,
        },
        transitionCondition: {
            type: 'object',
            description:
                'The transition condition for the next automated milestone progression.',
            additionalProperties: true,
            nullable: true,
        },
        strategies: {
            type: 'array',
            description:
                'A list of strategies that are attached to this milestone.',
            items: {
                $ref: '#/components/schemas/releasePlanMilestoneStrategySchema',
            },
        },
    },
    components: {
        schemas: {
            releasePlanMilestoneStrategySchema,
            createFeatureStrategySchema,
            parametersSchema,
            constraintSchema,
            createStrategyVariantSchema,
        },
    },
} as const;

export type ReleasePlanMilestoneSchema = FromSchema<
    typeof releasePlanMilestoneSchema
>;
