import type { FromSchema } from 'json-schema-to-ts';
import { bulkRegistrationSchema } from './bulk-registration-schema.js';
import { dateSchema } from './date-schema.js';
import { clientMetricsEnvSchema } from './client-metrics-env-schema.js';
import { impactMetricsSchema } from './impact-metrics-schema.js';

export const bulkMetricsSchema = {
    $id: '#/components/schemas/bulkMetricsSchema',
    type: 'object',
    required: ['applications', 'metrics'],
    description:
        'A batch of metrics accumulated by Edge (or other compatible applications). Includes both application registrations as well usage metrics from clients',
    properties: {
        applications: {
            description: 'A list of applications registered by an Unleash SDK',
            type: 'array',
            items: {
                $ref: '#/components/schemas/bulkRegistrationSchema',
            },
        },
        metrics: {
            description:
                'a list of client usage metrics registered by downstream providers. (Typically Unleash Edge)',
            type: 'array',
            items: {
                $ref: '#/components/schemas/clientMetricsEnvSchema',
            },
        },
        impactMetrics: {
            description:
                'a list of custom impact metrics registered by downstream providers. (Typically Unleash Edge)',
            type: 'array',
            items: {
                $ref: '#/components/schemas/impactMetricsSchema',
            },
        },
    },
    components: {
        schemas: {
            bulkRegistrationSchema,
            dateSchema,
            clientMetricsEnvSchema,
            impactMetricsSchema,
        },
    },
} as const;
export type BulkMetricsSchema = FromSchema<typeof bulkMetricsSchema>;
