import { FromSchema } from 'json-schema-to-ts';

export const featureEnvironmentMetricsSchema = {
    $id: '#/components/schemas/featureEnvironmentMetricsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['environment', 'timestamp', 'yes', 'no'],
    properties: {
        featureName: {
            type: 'string',
        },
        appName: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        timestamp: {
            type: 'string',
            format: 'date-time',
        },
        yes: {
            type: 'number',
        },
        no: {
            type: 'number',
        },
    },
    components: {},
} as const;

export type FeatureEnvironmentMetricsSchema = FromSchema<
    typeof featureEnvironmentMetricsSchema
>;
