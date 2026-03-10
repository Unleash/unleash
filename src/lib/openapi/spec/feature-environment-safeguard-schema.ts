import type { FromSchema } from 'json-schema-to-ts';
import { metricQuerySchema } from './metric-query-schema.js';
import { safeguardTriggerConditionSchema } from './safeguard-trigger-condition-schema.js';

export const featureEnvironmentSafeguardSchema = {
    $id: '#/components/schemas/featureEnvironmentSafeguardSchema',
    type: 'object',
    required: ['id', 'action', 'triggerCondition', 'impactMetric'],
    description: 'A safeguard configuration for a feature environment.',
    additionalProperties: false,
    properties: {
        id: {
            type: 'string',
            description: 'The unique ULID identifier for this safeguard',
            example: '01JB9GGTGQYEQ9D40R17T3YVW1',
        },
        action: {
            type: 'object',
            required: ['type', 'featureName', 'environment', 'project'],
            additionalProperties: false,
            description: 'Disable a feature in an environment when triggered.',
            properties: {
                type: {
                    type: 'string',
                    description: 'The type of action to perform.',
                    example: 'disableFeatureEnvironment',
                },
                featureName: {
                    type: 'string',
                    description:
                        'The feature flag name this safeguard applies to.',
                },
                environment: {
                    type: 'string',
                    description: 'The environment this safeguard applies to.',
                },
                project: {
                    type: 'string',
                    description: 'The project this safeguard applies to.',
                },
            },
        },
        triggerCondition: {
            $ref: '#/components/schemas/safeguardTriggerConditionSchema',
            description: 'The condition that triggers the safeguard.',
        },
        impactMetric: {
            type: 'object',
            required: ['id', ...metricQuerySchema.required],
            additionalProperties: false,
            properties: {
                id: {
                    type: 'string',
                    description: 'The unique identifier for this impact metric',
                    example: '01JB9GGTGQYEQ9D40R17T3YVW1',
                },
                ...metricQuerySchema.properties,
            },
            description:
                'The metric configuration used to evaluate the safeguard condition.',
        },
    },
    components: {
        schemas: {
            metricQuerySchema,
            safeguardTriggerConditionSchema,
        },
    },
} as const;

export type FeatureEnvironmentSafeguardSchema = FromSchema<
    typeof featureEnvironmentSafeguardSchema
>;
