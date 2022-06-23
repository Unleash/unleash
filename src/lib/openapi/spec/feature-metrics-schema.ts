import { FromSchema } from 'json-schema-to-ts';
import { featureEnvironmentMetricsSchema } from './feature-environment-metrics-schema';

export const featureMetricsSchema = {
    $id: '#/components/schemas/featureMetricsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'maturity', 'data'],
    properties: {
        version: {
            type: 'number',
        },
        maturity: {
            type: 'string',
        },
        data: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureEnvironmentMetricsSchema',
            },
        },
    },
    components: {
        schemas: {
            featureEnvironmentMetricsSchema,
        },
    },
} as const;

export type FeatureMetricsSchema = FromSchema<typeof featureMetricsSchema>;
