import type { FromSchema } from 'json-schema-to-ts';

export const unknownFlagSchema = {
    $id: '#/components/schemas/unknownFlagSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'lastSeenAt'],
    description: 'An unknown flag report',
    properties: {
        name: {
            type: 'string',
            description: 'The name of the unknown flag.',
            example: 'my-unknown-flag',
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            description:
                'The date and time when the unknown flag was last reported.',
            example: '2023-10-01T12:00:00Z',
        },
        lastEventAt: {
            type: 'string',
            format: 'date-time',
            description:
                'The date and time when the last event for the unknown flag name occurred, if any.',
            example: '2023-10-01T12:00:00Z',
            nullable: true,
        },
        reports: {
            type: 'array',
            description: 'The list of reports for this unknown flag.',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['appName', 'environments'],
                properties: {
                    appName: {
                        type: 'string',
                        description:
                            'The name of the application that reported the unknown flag.',
                        example: 'my-app',
                    },
                    environments: {
                        type: 'array',
                        description:
                            'The list of environments where this application reported the unknown flag.',
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['environment', 'seenAt'],
                            properties: {
                                environment: {
                                    type: 'string',
                                    description:
                                        'The environment in which the unknown flag was reported.',
                                    example: 'production',
                                },
                                seenAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    description:
                                        'The date and time when the unknown flag was last seen in this environment.',
                                    example: '2023-10-01T12:00:00Z',
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

export type UnknownFlagSchema = FromSchema<typeof unknownFlagSchema>;
