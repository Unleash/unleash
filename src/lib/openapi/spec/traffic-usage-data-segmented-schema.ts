import { FromSchema } from 'json-schema-to-ts';

export const trafficUsageDataSegmentedSchema = {
    $id: '#/components/schemas/trafficUsageDataSegmentedSchema',
    type: 'object',
    description: 'schemastuff',
    properties: {
        apiUsage: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    period: {
                        type: 'string',
                        format: 'date-time',
                        example: '2023-04-19T08:15:14.000Z',
                        description:
                            'The last time the application environment instance was seen',
                    },
                    apiData: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                day: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2023-04-19T08:15:14.000Z',
                                    description:
                                        'The day of the period for which the usage is counted',
                                },
                                apiPath: {
                                    type: 'string',
                                    description: 'The path of the API',
                                    example: '/api/client/features',
                                },
                                statusCodeSeriesUsage: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            statusCodeSeries: {
                                                type: 'number',
                                                description:
                                                    'The status code series',
                                                example: 200,
                                            },
                                            count: {
                                                type: 'number',
                                                description:
                                                    'The number of requests',
                                                example: 100,
                                            },
                                        },
                                    },
                                },
                            },
                            required: [],
                        },
                    },
                },
                required: [],
            },
        },
    },
    components: {},
} as const;

export type TrafficUsageDataSegmentedSchema = FromSchema<
    typeof trafficUsageDataSegmentedSchema
>;
