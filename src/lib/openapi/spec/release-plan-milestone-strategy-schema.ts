import type { FromSchema } from 'json-schema-to-ts';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';

export const releasePlanMilestoneStrategySchema = {
    $id: '#/components/schemas/releasePlanMilestoneStrategySchema',
    additionalProperties: false,
    description:
        'Schema representing the creation of a release plan milestone strategy.',
    type: 'object',
    required: ['id', 'milestoneId', 'sortOrder', 'strategyName'],
    properties: {
        id: {
            type: 'string',
            description:
                "The milestone strategy's ID. Milestone strategy IDs are ulids.",
            example: '01JB9GGTGQYEQ9D40R17T3YVW3',
            nullable: false,
        },
        milestoneId: {
            type: 'string',
            description:
                'The ID of the milestone that this strategy belongs to.',
            example: '01JB9GGTGQYEQ9D40R17T3YVW1',
        },
        sortOrder: createFeatureStrategySchema.properties.sortOrder,
        title: createFeatureStrategySchema.properties.title,
        strategyName: createFeatureStrategySchema.properties.name,
        parameters: createFeatureStrategySchema.properties.parameters,
        constraints: createFeatureStrategySchema.properties.constraints,
        variants: createFeatureStrategySchema.properties.variants,
        segments: createFeatureStrategySchema.properties.segments,
    },
    components: {
        schemas: {
            createFeatureStrategySchema,
            parametersSchema,
            constraintSchema,
            createStrategyVariantSchema,
        },
    },
} as const;

export type ReleasePlanMilestoneStrategySchema = FromSchema<
    typeof releasePlanMilestoneStrategySchema,
    { keepDefaultedPropertiesOptional: true }
>;
