import { FromSchema } from 'json-schema-to-ts';
import { dateSchema } from './date-schema';

export const bulkMetricSchema = {
    $id: '#/components/schemas/bulkMetricSchema',
    type: 'object',
    required: ['appName', 'featureName', 'environment', 'timestamp'],
    properties: {
        featureName: {
            type: 'string',
        },
        appName: {
            type: 'string',
        },
        instanceId: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        timestamp: {
            $ref: '#/components/schemas/dateSchema',
        },
        yes: {
            type: 'number',
        },
        no: {
            type: 'number',
        },
        variants: {
            type: 'array',
        },
    },
    components: {
        dateSchema,
    },
} as const;

export type BulkMetricSchema = FromSchema<typeof bulkMetricSchema>;
