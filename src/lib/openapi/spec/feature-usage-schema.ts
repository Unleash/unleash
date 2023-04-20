import { FromSchema } from 'json-schema-to-ts';
import { featureEnvironmentMetricsSchema } from './feature-environment-metrics-schema';
import { dateSchema } from './date-schema';

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
            description: 'The version of this schema',
            type: 'integer',
            minimum: 1,
        },
        maturity: {
            description:
                'The maturity level of this API (alpha, beta, stable, deprecated)',
            type: 'string',
            example: 'stable',
        },
        featureName: {
            description: 'The name of the feature',
            type: 'string',
            example: 'my.special.feature',
        },
        lastHourUsage: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureEnvironmentMetricsSchema',
            },
        },
        seenApplications: {
            description: 'A list of applications seen using this feature',
            type: 'array',
            items: {
                type: 'string',
            },
            examples: ['accounting', 'billing', 'booking'],
        },
    },
    components: {
        schemas: {
            featureEnvironmentMetricsSchema,
            dateSchema,
        },
    },
} as const;

export type FeatureUsageSchema = FromSchema<typeof featureUsageSchema>;
