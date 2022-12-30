import { FromSchema } from 'json-schema-to-ts';

export const requestsPerSecondSchema = {
    $id: '#/components/schemas/requestsPerSecondSchema',
    type: 'object',
    properties: {
        status: {
            type: 'string',
        },
        data: {
            type: 'object',
            properties: {
                resultType: {
                    type: 'string',
                },
                result: {
                    description:
                        'An array of values per metric. Each one represents a line in the graph labeled by its metric name',
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            metric: {
                                description:
                                    'A key value set representing the metric',
                                type: 'object',
                                properties: {
                                    appName: {
                                        type: 'string',
                                    },
                                    endpoint: {
                                        type: 'string',
                                    },
                                },
                            },
                            values: {
                                description:
                                    'An array of arrays. Each element of the array is an array of size 2 consisting of the 2 axis for the graph: in position zero the x axis represented as a number and position one the y axis represented as string',
                                type: 'array',
                                items: {
                                    type: 'array',
                                    items: {
                                        anyOf: [
                                            { type: 'string' },
                                            { type: 'number' },
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
