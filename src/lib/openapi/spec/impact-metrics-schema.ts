import type { FromSchema } from 'json-schema-to-ts';

export const impactMetricsSchema = {
    $id: '#/components/schemas/impactMetricsSchema',
    type: 'object',
    description: 'Used for reporting impact metrics from SDKs',
    oneOf: [
        {
            required: ['name', 'help', 'type', 'samples'],
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
                    enum: ['counter', 'gauge'],
                    example: 'counter',
                },
                samples: {
                    description: 'Samples of the numeric metric',
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['value'],
                        description:
                            'A sample of a numeric metric with a value and optional labels',
                        properties: {
                            value: {
                                type: 'number',
                                description: 'The value of the metric sample',
                                example: 10,
                            },
                            labels: {
                                description:
                                    'Optional labels for the metric sample',
                                type: 'object',
                                additionalProperties: {
                                    oneOf: [
                                        { type: 'string' },
                                        { type: 'number' },
                                    ],
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
        },
        {
            required: ['name', 'help', 'type', 'samples'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the impact metric',
                    example: 'my-histogram',
                },
                help: {
                    description:
                        'Human-readable description of what the metric measures',
                    type: 'string',
                    example: 'Measures request duration',
                },
                type: {
                    description: 'Type of the metric',
                    type: 'string',
                    enum: ['histogram'],
                    example: 'histogram',
                },
                samples: {
                    description: 'Samples of the histogram metric',
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['count', 'sum', 'buckets'],
                        description:
                            'A sample of a histogram metric with count, sum, buckets and optional labels',
                        properties: {
                            count: {
                                type: 'number',
                                description: 'Total count of observations',
                                example: 100,
                            },
                            sum: {
                                type: 'number',
                                description: 'Sum of all observed values',
                                example: 1500,
                            },
                            buckets: {
                                type: 'array',
                                description: 'Histogram buckets',
                                items: {
                                    type: 'object',
                                    required: ['le', 'count'],
                                    properties: {
                                        le: {
                                            oneOf: [
                                                { type: 'number' },
                                                {
                                                    type: 'string',
                                                    enum: ['+Inf'],
                                                },
                                            ],
                                            description:
                                                'Upper bound of the bucket',
                                            example: 0.5,
                                        },
                                        count: {
                                            type: 'number',
                                            description:
                                                'Count of observations in this bucket',
                                            example: 30,
                                        },
                                    },
                                },
                            },
                            labels: {
                                description:
                                    'Optional labels for the metric sample',
                                type: 'object',
                                additionalProperties: {
                                    oneOf: [
                                        { type: 'string' },
                                        { type: 'number' },
                                    ],
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
        },
    ],
    components: {
        schemas: {},
    },
} as const;

export type ImpactMetricsSchema = FromSchema<typeof impactMetricsSchema>;
