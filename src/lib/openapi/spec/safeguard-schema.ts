import type { FromSchema } from 'json-schema-to-ts';
import { metricQuerySchema } from './metric-query-schema.js';
import { safeguardTriggerConditionSchema } from './safeguard-trigger-condition-schema.js';

export const safeguardSchema = {
    $id: '#/components/schemas/safeguardSchema',
    type: 'object',
    required: ['id', 'action', 'triggerCondition', 'impactMetric'],
    description: 'A safeguard configuration for a release plan.',
    additionalProperties: false,
    properties: {
        id: {
            type: 'string',
            description: 'The unique ULID identifier for this safeguard',
            example: '01JB9GGTGQYEQ9D40R17T3YVW1',
        },
        action: {
            type: 'object',
            required: ['type', 'id'],
            additionalProperties: false,
            description: 'The action to take when the safeguard is triggered.',
            properties: {
                type: {
                    type: 'string',
                    description: 'The type of action to perform.',
                    example: 'pauseReleasePlanProgressions',
                },
                id: {
                    type: 'string',
                    description:
                        'The ID of the release plan this safeguard applies to.',
                    example: '01JB9GGTGQYEQ9D40R17T3YVW2',
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

export type SafeguardSchema = FromSchema<typeof safeguardSchema>;
