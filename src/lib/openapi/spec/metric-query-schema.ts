import type { FromSchema } from 'json-schema-to-ts';

export const metricQuerySchema = {
    $id: '#/components/schemas/metricQuerySchema',
    type: 'object',
    required: ['metricName', 'timeRange', 'aggregationMode', 'labelSelectors'],
    description:
        'Common metric query configuration for selecting and filtering metric data.',
    additionalProperties: false,
    properties: {
        metricName: {
            type: 'string',
            description:
                'The Prometheus metric series to query. It includes both unleash prefix and metric type and display name',
            example: 'unleash_counter_feature_toggle_usage_total',
        },
        timeRange: {
            type: 'string',
            enum: ['hour', 'day', 'week', 'month'],
            description: 'The time range for the metric data.',
            example: 'day',
        },
        aggregationMode: {
            type: 'string',
            description: 'The aggregation mode for the metric data.',
            enum: ['rps', 'count', 'avg', 'sum', 'p95', 'p99', 'p50'],
            example: 'rps',
        },
        labelSelectors: {
            type: 'object',
            additionalProperties: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
            description:
                'The selected labels and their values for filtering the metric data.',
            example: {
                environment: ['development'],
                project: ['default'],
            },
        },
    },
    components: {},
} as const;

export type MetricQuerySchema = FromSchema<typeof metricQuerySchema>;

