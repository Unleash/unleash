import type { FromSchema } from 'json-schema-to-ts';

export const releaseAgentSafeguardSchema = {
    $id: '#/components/schemas/releaseAgentSafeguardSchema',
    type: 'object',
    additionalProperties: false,
    required: ['featureName', 'impactMetric', 'triggerCondition'],
    description:
        'A feature-environment safeguard attached to a release-agent sequence. On breach the flag is auto-disabled; the sequence itself continues firing.',
    properties: {
        featureName: {
            type: 'string',
            description:
                'Target feature. Must also appear in the sequence actions.',
        },
        impactMetric: {
            type: 'object',
            additionalProperties: false,
            required: [
                'metricName',
                'timeRange',
                'aggregationMode',
                'labelSelectors',
            ],
            properties: {
                metricName: { type: 'string' },
                timeRange: {
                    type: 'string',
                    enum: ['hour', 'day', 'week', 'month'],
                },
                aggregationMode: {
                    type: 'string',
                    enum: ['rps', 'count', 'avg', 'sum', 'p95', 'p99', 'p50'],
                },
                labelSelectors: {
                    type: 'object',
                    additionalProperties: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                source: {
                    type: 'string',
                    enum: ['internal', 'external'],
                },
            },
        },
        triggerCondition: {
            type: 'object',
            additionalProperties: false,
            required: ['operator', 'threshold'],
            properties: {
                operator: { type: 'string', enum: ['>', '<'] },
                threshold: { type: 'number' },
            },
        },
    },
    components: { schemas: {} },
} as const;

export type ReleaseAgentSafeguardSchema = FromSchema<
    typeof releaseAgentSafeguardSchema
>;
