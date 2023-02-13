import { FromSchema } from 'json-schema-to-ts';
import { bulkRegistrationSchema } from './bulk-registration-schema';
import { clientMetricsSchema } from './client-metrics-schema';
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
                $ref: '#/components/schemas/clientMetricsSchema',
            },
        },
    },
    components: {
        schemas: {
            bulkRegistrationSchema,
            dateSchema,
            clientMetricsSchema,
        },
    },
} as const;

export type BulkMetricsSchema = FromSchema<typeof bulkMetricsSchema>;
