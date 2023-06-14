import { FromSchema } from 'json-schema-to-ts';

export const sdkContextSchema = {
    $id: '#/components/schemas/sdkContextSchema',
    description: 'The Unleash context as modeled in client SDKs',
    type: 'object',
    additionalProperties: true,
    required: ['appName'],
    properties: {
        appName: {
            type: 'string',
            minLength: 1,
            example: 'My cool application.',
            description: 'The name of the application.',
        },
        currentTime: {
            type: 'string',
            format: 'date-time',
            example: '2022-07-05T12:56:41+02:00',
            description:
                'A DateTime (or similar) data class instance or a string in an RFC3339-compatible format. Defaults to the current time if not set by the user.',
        },
        environment: {
            type: 'string',
            deprecated: true,
            description: 'The environment the app is running in.',
        },
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
            description: "The app's IP address",
        },
        sessionId: {
            type: 'string',
            example: 'b65e7b23-fec0-4814-a129-0e9861ef18fc',
            description: 'An identifier for the current session',
        },
        userId: {
            type: 'string',
            example: 'username@provider.com',
            description: 'An identifier for the current user',
        },
    },
    components: {},
} as const;

export type SdkContextSchema = FromSchema<typeof sdkContextSchema>;
