import { FromSchema } from 'json-schema-to-ts';
import { bulkRegistrationSchema } from './bulk-registration-schema';
import { dateSchema } from './date-schema';
import { clientMetricsEnvSchema } from './client-metrics-env-schema';

export const bulkMetricsSchema = {
    $id: '#/components/schemas/bulkMetricsSchema',
    type: 'object',
    required: ['applications', 'metrics'],
    description:
        'A batch of metrics accumulated by Edge (or other compatible applications). Includes both application registrations as well usage metrics from clients',
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
                $ref: '#/components/schemas/clientMetricsEnvSchema',
            },
        },
    },
    components: {
        schemas: {
            bulkRegistrationSchema,
            dateSchema,
            clientMetricsEnvSchema,
        },
    },
} as const;
export type BulkMetricsSchema = FromSchema<typeof bulkMetricsSchema>;
