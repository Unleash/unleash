import { FromSchema } from 'json-schema-to-ts';
import { featureEnvironmentMetricsSchema } from './feature-environment-metrics-schema';

export const featureUsageSchema = {
    $id: '#/components/schemas/featureUsageSchema',
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
                $ref: '#/components/schemas/featureEnvironmentMetricsSchema',
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
            featureEnvironmentMetricsSchema,
        },
    },
} as const;

export type FeatureUsageSchema = FromSchema<typeof featureUsageSchema>;
