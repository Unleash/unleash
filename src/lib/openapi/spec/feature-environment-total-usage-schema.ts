import type { FromSchema } from 'json-schema-to-ts';

export const featureEnvironmentTotalUsageSchema = {
    $id: '#/components/schemas/featureEnvironmentTotalUsageSchema',
    type: 'object',
    additionalProperties: false,
    required: ['environment', 'yes', 'no'],
    description:
        'How many times the feature flag was evaluated to `true` (yes) and `false` (no) in an environment, accumulated over the metrics retention period',
    properties: {
        environment: {
            description: 'The environment the metrics were recorded in',
            type: 'string',
            example: 'development',
        },
        yes: {
            description: 'How many times the flag evaluated to true',
            type: 'integer',
            example: 974,
            minimum: 0,
        },
        no: {
            description: 'How many times the flag evaluated to false',
            type: 'integer',
            example: 50,
            minimum: 0,
        },
    },
    components: {},
} as const;

export type FeatureEnvironmentTotalUsageSchema = FromSchema<
    typeof featureEnvironmentTotalUsageSchema
>;
