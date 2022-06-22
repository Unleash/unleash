import { FromSchema } from 'json-schema-to-ts';

export const clientMetricsEnvSchema = {
    $id: '#/components/schemas/clientMetricsEnvSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'featureName',
        'appName',
        'environment',
        'timestamp',
        'yes',
        'no',
    ],
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
            nullable: true,
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

export type ClientMetricsEnvSchema = FromSchema<typeof clientMetricsEnvSchema>;
