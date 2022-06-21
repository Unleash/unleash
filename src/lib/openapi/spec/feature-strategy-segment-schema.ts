import { FromSchema } from 'json-schema-to-ts';

export const featureStrategySegmentSchema = {
    $id: '#/components/schemas/featureStrategySegmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['segmentId', 'featureStrategyId'],
    properties: {
        segmentId: {
            type: 'integer',
        },
        featureStrategyId: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type FeatureStrategySegmentSchema = FromSchema<
    typeof featureStrategySegmentSchema
>;
