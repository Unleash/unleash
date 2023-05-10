import { FromSchema } from 'json-schema-to-ts';
import { dateSchema } from './date-schema';

export const featureEnvironmentMetricsSchema = {
    $id: '#/components/schemas/featureEnvironmentMetricsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['environment', 'timestamp', 'yes', 'no'],
    description:
        'How many times `feautreName` was evaluated to `true` (yes) and `false` (no) for `appName` in `environmnet`',
    properties: {
        featureName: {
            description: 'The name of the feature',
            type: 'string',
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
                'The start of the time window these metrics are valid for. The window is usually 1 hour wide',
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
        dateSchema,
    },
} as const;

export type FeatureEnvironmentMetricsSchema = FromSchema<
    typeof featureEnvironmentMetricsSchema
>;
