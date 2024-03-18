import type { FromSchema } from 'json-schema-to-ts';

export const requestsPerSecondSchema = {
    $id: '#/components/schemas/requestsPerSecondSchema',
    type: 'object',
    description:
        'Statistics for usage of Unleash, formatted so it can easily be used in a graph',
    properties: {
        status: {
            type: 'string',
            description:
                'Whether the query against prometheus succeeded or failed',
            enum: ['success', 'failure'],
            example: 'success',
        },
        data: {
            type: 'object',
            description: 'The query result from prometheus',
            properties: {
                resultType: {
                    type: 'string',
                    description: 'Prometheus compatible result type.',
                    enum: ['matrix', 'vector', 'scalar', 'string'],
                    example: 'vector',
                },
                result: {
                    description:
                        'An array of values per metric. Each one represents a line in the graph labeled by its metric name',
                    type: 'array',
                    items: {
                        type: 'object',
                        description:
                            'A representation of a single metric to build a line in a graph',
                        properties: {
                            metric: {
                                description:
                                    'A key value set representing the metric',
                                type: 'object',
                                properties: {
                                    appName: {
                                        description:
                                            'Name of the application this metric relates to',
                                        type: 'string',
                                        example: 'mySdk',
                                    },
                                    endpoint: {
                                        description:
                                            'Which endpoint has been accessed',
                                        type: 'string',
                                        example: '/api/frontend',
                                    },
                                },
                            },
                            values: {
                                description:
                                    'An array of arrays. Each element of the array is an array of size 2 consisting of the 2 axis for the graph: in position zero the x axis represented as a number and position one the y axis represented as string',
                                type: 'array',
                                items: {
                                    type: 'array',
                                    description:
                                        'Either the x axis represented as a number or the y axis represented as a string',
                                    items: {
                                        anyOf: [
                                            {
                                                type: 'string',
                                                description:
                                                    'An identifier for the line in the graph',
                                            },
                                            {
                                                type: 'number',
                                                description:
                                                    'The number of requests at this point in time',
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type RequestsPerSecondSchema = FromSchema<
    typeof requestsPerSecondSchema
>;
