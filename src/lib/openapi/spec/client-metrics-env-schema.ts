import { dateSchema } from './date-schema';
import { FromSchema } from 'json-schema-to-ts';

export const clientMetricsEnvSchema = {
    $id: '#/components/schemas/clientMetricsEnvSchema',
    type: 'object',
    required: ['featureName', 'appName', 'environment'],
    additionalProperties: true,
    description: 'Used for reporting feature evaluation results from SDKs',
    properties: {
        featureName: {
            type: 'string',
            description: 'Name of the feature checked by the SDK',
            example: 'my.special.feature',
        },
        appName: {
            description: 'The name of the application the SDK is being used in',
            type: 'string',
            example: 'accounting',
        },
        environment: {
            description: 'Which environment the SDK is being used in',
            type: 'string',
            example: 'development',
        },
        timestamp: {
            description:
                'The start of the time window these metrics are valid for. The window is 1 hour wide',
            example: '1926-05-08T12:00:00.000Z',
            $ref: '#/components/schemas/dateSchema',
        },
        yes: {
            description: 'How many times the toggle evaluated to true',
            type: 'integer',
            example: 974,
            minimum: 0,
        },
        no: {
            description: 'How many times the toggle evaluated to false',
            type: 'integer',
            example: 50,
            minimum: 0,
        },
        variants: {
            description: 'How many times each variant was returned',
            type: 'object',
            additionalProperties: {
                type: 'integer',
                minimum: 0,
            },
            example: {
                variantA: 15,
                variantB: 25,
                variantC: 5,
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
