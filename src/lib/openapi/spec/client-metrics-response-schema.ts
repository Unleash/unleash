import { FromSchema } from 'json-schema-to-ts';
import { clientMetricsEnvSchema } from './client-metrics-env-schema';

export const clientMetricsResponseSchema = {
    $id: '#/components/schemas/clientMetricsResponseSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'maturity', 'environment', 'timestamp', 'yes', 'no'],
    properties: {
        version: {
            type: 'number',
        },
        maturity: {
            type: 'string',
        },
        data: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/clientMetricsEnvSchema',
            },
        },
    },
    components: {
        schemas: {
            clientMetricsEnvSchema,
        },
    },
} as const;

export type ClientMetricsResponseSchema = FromSchema<
    typeof clientMetricsResponseSchema
>;
