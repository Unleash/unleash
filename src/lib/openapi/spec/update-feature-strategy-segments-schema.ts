import type { FromSchema } from 'json-schema-to-ts';

export const updateFeatureStrategySegmentsSchema = {
    $id: '#/components/schemas/updateFeatureStrategySegmentsSchema',
    type: 'object',
    required: ['projectId', 'strategyId', 'environmentId', 'segmentIds'],
    description: 'Data required to update segments for a strategy.',
    properties: {
        projectId: {
            type: 'string',
            description: 'The ID of the project that the strategy belongs to.',
            example: 'red-vista',
        },
        strategyId: {
            type: 'string',
            description: 'The ID of the strategy to update segments for.',
            example: '15d1e20b-6310-4e17-a0c2-9fb84de3053a',
        },
        environmentId: {
            type: 'string',
            description: 'The ID of the strategy environment.',
            example: 'development',
        },
        segmentIds: {
            type: 'array',
            description:
                'The new list of segments (IDs) to use for this strategy. Any segments not in this list will be removed from the strategy.',
            example: [1, 5, 6],
            items: {
                type: 'integer',
                minimum: 0,
            },
        },
    },
    components: {},
} as const;

export type UpdateFeatureStrategySegmentsSchema = FromSchema<
    typeof updateFeatureStrategySegmentsSchema
>;
