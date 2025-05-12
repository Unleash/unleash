import type { FromSchema } from 'json-schema-to-ts';

export const unknownFlagSchema = {
    $id: '#/components/schemas/unknownFlagSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'reportedBy'],
    description: 'An unknown flag that has been reported by the system',
    properties: {
        name: {
            type: 'string',
            description: 'The name of the unknown flag.',
            example: 'my-unknown-flag',
        },
        reportedBy: {
            description:
                'Details about the application that reported the unknown flag.',
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['appName', 'seenAt'],
                properties: {
                    appName: {
                        type: 'string',
                        description:
                            'The name of the application that reported the unknown flag.',
                        example: 'my-app',
                    },
                    seenAt: {
                        type: 'string',
                        format: 'date-time',
                        description:
                            'The date and time when the unknown flag was reported.',
                        example: '2023-10-01T12:00:00Z',
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type UnknownFlagSchema = FromSchema<typeof unknownFlagSchema>;
