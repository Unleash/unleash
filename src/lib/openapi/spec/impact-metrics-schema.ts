import type { FromSchema } from 'json-schema-to-ts';

export const impactMetricsSchema = {
    $id: '#/components/schemas/impactMetricsSchema',
    type: 'object',
    required: ['name', 'help', 'type', 'samples'],
    description: 'Used for reporting impact metrics from SDKs',
    properties: {
        name: {
            type: 'string',
            description: 'Name of the impact metric',
            example: 'my-counter',
        },
        help: {
            description:
                'Human-readable description of what the metric measures',
            type: 'string',
            example: 'Counts the number of operations',
        },
        type: {
            description: 'Type of the metric',
            type: 'string',
            enum: ['counter', 'gauge', 'histogram'],
            example: 'counter',
        },
        samples: {
            description: 'Samples of the metric',
            type: 'array',
            items: {
                type: 'object',
                required: ['value'],
                description:
                    'A sample of a metric with a value and optional labels',
                properties: {
                    value: {
                        type: 'number',
                        description: 'The value of the metric sample',
                        example: 10,
                    },
                    labels: {
                        description: 'Optional labels for the metric sample',
                        type: 'object',
                        additionalProperties: {
                            type: 'string',
                        },
                        example: {
                            application: 'my-app',
                            environment: 'production',
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type ImpactMetricsSchema = FromSchema<typeof impactMetricsSchema>;
