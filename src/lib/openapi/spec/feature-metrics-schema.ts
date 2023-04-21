import { FromSchema } from 'json-schema-to-ts';
import { featureEnvironmentMetricsSchema } from './feature-environment-metrics-schema';
import { dateSchema } from './date-schema';

export const featureMetricsSchema = {
    $id: '#/components/schemas/featureMetricsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'maturity', 'data'],
    description: 'A batch of feature metrics',
    properties: {
        version: {
            description: 'The version of this schema',
            type: 'integer',
            minimum: 1,
        },
        maturity: {
            description:
                'The maturity level of this API (alpha, beta, stable, deprecated)',
            type: 'string',
            example: 'stable',
        },
        data: {
            description: 'Metrics gathered per environment',
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureEnvironmentMetricsSchema',
            },
        },
    },
    components: {
        schemas: {
            featureEnvironmentMetricsSchema,
            dateSchema,
        },
    },
} as const;

export type FeatureMetricsSchema = FromSchema<typeof featureMetricsSchema>;
