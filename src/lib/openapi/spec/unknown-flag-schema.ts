import type { FromSchema } from 'json-schema-to-ts';

export const unknownFlagSchema = {
    $id: '#/components/schemas/unknownFlagSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'appName', 'seenAt', 'environment'],
    description: 'An unknown flag report',
    properties: {
        name: {
            type: 'string',
            description: 'The name of the unknown flag.',
            example: 'my-unknown-flag',
        },
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
        environment: {
            type: 'string',
            description:
                'The environment in which the unknown flag was reported.',
            example: 'production',
        },
    },
    components: {},
} as const;

export type UnknownFlagSchema = FromSchema<typeof unknownFlagSchema>;
