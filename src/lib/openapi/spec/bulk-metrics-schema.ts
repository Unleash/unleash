import { FromSchema } from 'json-schema-to-ts';
import { bulkMetricSchema } from './bulk-metric-schema';
import { bulkRegistrationSchema } from './bulk-registration-schema';

export const bulkMetricsSchema = {
    $id: '#/components/schemas/bulkMetricsSchema',
    type: 'object',
    required: ['name'],
    properties: {
        applications: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/bulkRegistrationSchema',
            },
        },
        metrics: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/bulkMetricSchema',
            },
        },
    },
    components: {
        schemas: {
            bulkMetricSchema,
            bulkRegistrationSchema,
        },
    },
} as const;

export type BulkMetricsSchema = FromSchema<typeof bulkMetricsSchema>;
