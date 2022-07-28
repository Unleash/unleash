import { FromSchema } from 'json-schema-to-ts';

export const sdkContextSchema = {
    $id: '#/components/schemas/sdkContextSchema',
    description: 'The Unleash context as modeled in client SDKs',
    type: 'object',
    additionalProperties: {
        type: 'string',
        example: 'top-level custom context value',
    },
    required: ['appName'],
    properties: {
        appName: {
            type: 'string',
            minLength: 1,
            example: 'My cool application.',
        },
        currentTime: {
            type: 'string',
            format: 'date-time',
            example: '2022-07-05T12:56:41+02:00',
        },
        environment: { type: 'string', deprecated: true },
        properties: {
            type: 'object',
            additionalProperties: { type: 'string' },
            example: {
                customContextField: 'this is one!',
                otherCustomField: '3',
            },
        },
        remoteAddress: {
            type: 'string',
            example: '192.168.1.1',
        },
        sessionId: {
            type: 'string',
            example: 'b65e7b23-fec0-4814-a129-0e9861ef18fc',
        },
        userId: { type: 'string', example: 'username@provider.com' },
    },
    components: {},
} as const;

export type SdkContextSchema = FromSchema<typeof sdkContextSchema>;
