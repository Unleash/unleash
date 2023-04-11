import { FromSchema } from 'json-schema-to-ts';
import { bulkRegistrationSchema } from './bulk-registration-schema';
import { dateSchema } from './date-schema';
import { clientMetricsEnvSchema } from './client-metrics-env-schema';

export const bulkMetricsSchema = {
    $id: '#/components/schemas/bulkMetricsSchema',
    type: 'object',
    required: ['applications', 'metrics'],
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
