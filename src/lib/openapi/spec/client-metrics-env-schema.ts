import { dateSchema } from './date-schema';
import { FromSchema } from 'json-schema-to-ts';

export const clientMetricsEnvSchema = {
    $id: '#/components/schemas/clientMetricsEnvSchema',
    type: 'object',
    required: ['featureName', 'appName'],
    additionalProperties: true,
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
            $ref: '#/components/schemas/dateSchema',
        },
        yes: {
            type: 'number',
        },
        no: {
            type: 'number',
        },
        variants: {
            type: 'object',
            additionalProperties: {
                type: 'integer',
                minimum: 0,
            },
        },
    },
    components: {
        schemas: {
            dateSchema,
        },
    },
} as const;

export type ClientMetricsSchema = FromSchema<typeof clientMetricsEnvSchema>;
