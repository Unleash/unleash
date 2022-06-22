import { FromSchema } from 'json-schema-to-ts';
import { groupedClientMetricsSchema } from './grouped-client-metrics-schema';

export const toggleMetricsSummarySchema = {
    $id: '#/components/schemas/toggleMetricsSummarySchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'version',
        'maturity',
        'featureName',
        'lastHourUsage',
        'seenApplications',
    ],
    properties: {
        version: {
            type: 'number',
        },
        maturity: {
            type: 'string',
        },
        featureName: {
            type: 'string',
        },
        lastHourUsage: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/groupedClientMetricsSchema',
            },
        },
        seenApplications: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {
        schemas: {
            groupedClientMetricsSchema,
        },
    },
} as const;

export type ToggleMetricsSummarySchema = FromSchema<
    typeof toggleMetricsSummarySchema
>;
