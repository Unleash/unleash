import { FromSchema } from 'json-schema-to-ts';
import { bulkMetricSchema } from './bulk-metric-schema';
import { bulkRegistrationSchema } from './bulk-registration-schema';
import { dateSchema } from './date-schema';

export const bulkMetricsSchema = {
    $id: '#/components/schemas/bulkMetricsSchema',
    type: 'object',
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
            dateSchema,
        },
    },
} as const;

export type BulkMetricsSchema = FromSchema<typeof bulkMetricsSchema>;
