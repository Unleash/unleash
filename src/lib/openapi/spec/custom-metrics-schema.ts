import type { FromSchema } from 'json-schema-to-ts';
import { dateSchema } from './date-schema.js';

export const customMetricSchema = {
    $id: '#/components/schemas/customMetricSchema',
    type: 'object' as const,
    required: ['name', 'value'],
    description: 'A custom metric with name, value and optional labels',
    properties: {
        name: {
            type: 'string' as const,
            description: 'Name of the custom metric',
            example: 'http_responses_total',
        },
        value: {
            type: 'number' as const,
            description: 'Value of the custom metric',
            example: 1,
        },
        labels: {
            type: 'object' as const,
            description: 'Labels to categorize the metric',
            additionalProperties: {
                type: 'string' as const,
            },
            example: {
                status: '200',
                method: 'GET',
            },
        },
    },
};

export const customMetricsSchema = {
    $id: '#/components/schemas/customMetricsSchema',
    type: 'object' as const,
    required: ['metrics'],
    description: 'A collection of custom metrics',
    properties: {
        metrics: {
            type: 'array' as const,
            description: 'Array of custom metrics',
            items: {
                $ref: '#/components/schemas/customMetricSchema',
            },
        },
    },
    components: {
        schemas: {
            customMetricSchema,
            dateSchema,
        },
    },
} as const;

export type CustomMetricSchema = FromSchema<typeof customMetricSchema>;
export type CustomMetricsSchema = FromSchema<typeof customMetricsSchema>;
