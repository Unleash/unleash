import { FromSchema } from 'json-schema-to-ts';
import { dateSchema } from './date-schema';

export const clientMetricsSchema = {
    $id: '#/components/schemas/clientMetricsSchema',
    type: 'object',
    required: ['appName', 'bucket'],
    description:
        'Client usage metrics, accumulated in buckets of hour by hour by default',
    properties: {
        appName: {
            description:
                'The name of the application that is evaluating toggles',
            type: 'string',
            example: 'insurance-selector',
        },
        instanceId: {
            description:
                'A [(somewhat) unique identifier](https://docs.getunleash.io/reference/sdks/node#advanced-usage) for the application',
            type: 'string',
            example: 'application-name-dacb1234',
        },
        environment: {
            description: 'Which environment the application is running in',
            type: 'string',
            example: 'development',
        },
        bucket: {
            type: 'object',
            required: ['start', 'stop', 'toggles'],
            description:
                'Holds all metrics gathered over a window of time. Typically 1 hour wide',
            properties: {
                start: {
                    $ref: '#/components/schemas/dateSchema',
                    description:
                        'The start of the time window these metrics are valid for. The window is usually 1 hour wide',
                    example: '1926-05-08T12:00:00.000Z',
                },
                stop: {
                    $ref: '#/components/schemas/dateSchema',
                    description:
                        'The end of the time window these metrics are valid for. The window is 1 hour wide',
                    example: '1926-05-08T13:00:00.000Z',
                },
                toggles: {
                    type: 'object',
                    description:
                        'an object containing feature names with yes/no plus variant usage',
                    example: {
                        myCoolToggle: {
                            yes: 25,
                            no: 42,
                            variants: {
                                blue: 6,
                                green: 15,
                                red: 46,
                            },
                        },
                        myOtherToggle: {
                            yes: 0,
                            no: 100,
                        },
                    },
                    additionalProperties: {
                        type: 'object',
                        properties: {
                            yes: {
                                description:
                                    'How many times the toggle evaluated to true',
                                type: 'number',
                                example: 974,
                                minimum: 0,
                            },
                            no: {
                                description:
                                    'How many times the toggle evaluated to false',
                                type: 'integer',
                                example: 50,
                                minimum: 0,
                            },
                            variants: {
                                description:
                                    'An object describing how many times each variant was returned. Variant names are used as properties, and the number of times they were exposed is the corresponding value (i.e. `{ [variantName]: number }`).',
                                type: 'object',
                                additionalProperties: {
                                    type: 'integer',
                                    minimum: 0,
                                },
                                example: {
                                    variantA: 15,
                                    variantB: 25,
                                    variantC: 5,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            dateSchema,
        },
    },
} as const;

export type ClientMetricsSchema = FromSchema<typeof clientMetricsSchema>;
