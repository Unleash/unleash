import type { FromSchema } from 'json-schema-to-ts';

export const clientApplicationSchema = {
    $id: '#/components/schemas/clientApplicationSchema',
    type: 'object',
    required: ['appName', 'interval', 'started', 'strategies'],
    description: 'A client application is an instance of one of our SDKs',
    properties: {
        appName: {
            description:
                'An identifier for the app that uses the sdk, should be static across SDK restarts',
            type: 'string',
            example: 'example-app',
        },
        instanceId: {
            description:
                'A unique identifier identifying the instance of the application running the SDK. Often changes based on execution environment. For instance: two pods in Kubernetes will have two different instanceIds',
            type: 'string',
            example: 'b77f3d13-5f48-4a7b-a3f4-a449b97ce43a',
        },
        sdkVersion: {
            type: 'string',
            description:
                'An SDK version identifier. Usually formatted as "unleash-client-<language>:<version>"',
            example: 'unleash-client-java:7.0.0',
        },
        environment: {
            description: `The SDK's configured 'environment' property. This property was deprecated in v5. This property  does **not** control which Unleash environment the SDK gets toggles for. To control Unleash environments, use the SDKs API key.`,
            deprecated: true,
            type: 'string',
            example: 'development',
        },
        platformName: {
            description:
                'The platform the application is running on. For languages that compile to binaries, this can be omitted',
            type: 'string',
            example: '.NET Core',
        },
        platformVersion: {
            description:
                'The version of the platform the application is running on. Languages that compile to binaries, this is expected to be the compiler version used to assemble the binary.',
            type: 'string',
            example: '3.1',
        },
        yggdrasilVersion: {
            description:
                'The semantic version of the Yggdrasil engine used by the client. If the client is using a native engine this can be omitted.',
            type: 'string',
            example: '1.0.0',
        },
        specVersion: {
            description:
                'The version of the Unleash client specification the client supports',
            type: 'string',
            example: '3.0.0',
        },
        interval: {
            type: 'number',
            description:
                'How often (in seconds) does the client refresh its toggles',
            example: 10,
            minimum: 0,
        },
        started: {
            description:
                'Either an RFC-3339 timestamp or a unix timestamp in seconds',
            oneOf: [
                { type: 'string', format: 'date-time' },
                { type: 'number' },
            ],
            example: '2023-06-13T16:35:00.000Z',
        },
        strategies: {
            description: 'Which strategies the SDKs runtime knows about',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['default', 'gradualRollout', 'remoteAddress'],
        },
    },
    components: {},
} as const;

export type ClientApplicationSchema = FromSchema<
    typeof clientApplicationSchema
>;
