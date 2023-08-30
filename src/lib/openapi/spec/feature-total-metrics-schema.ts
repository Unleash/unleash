import { FromSchema } from 'json-schema-to-ts';

export const featureTotalMetricsSchema = {
    $id: '#/components/schemas/featureTotalMetricsSchema',
    type: 'array',
    items: {
        type: 'object',
        additionalProperties: false,
        required: ['environment', 'total'],
        properties: {
            environment: {
                description: 'Which environment was evaluated',
                type: 'string',
                example: 'development',
            },
            total: {
                description: 'How many times the toggle was evaluated',
                type: 'integer',
                example: 974,
                minimum: 0,
            },
        },
    },
    description:
        'How many times `featureName` was evaluated in each `environment`',
    components: {},
} as const;

export type FeatureTotalMetricsSchema = FromSchema<
    typeof featureTotalMetricsSchema
>;
