import type { FromSchema } from 'json-schema-to-ts';
import { dateSchema } from './date-schema.js';
import { customMetricSchema } from './custom-metric-schema.js';

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

export type CustomMetricsSchema = FromSchema<typeof customMetricsSchema>;
