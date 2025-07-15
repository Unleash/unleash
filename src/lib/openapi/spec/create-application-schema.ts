import type { FromSchema } from 'json-schema-to-ts';

export const createApplicationSchema = {
    $id: '#/components/schemas/createApplicationSchema',
    type: 'object',
    description: 'Reported application information from Unleash SDKs',
    properties: {
        appName: {
            deprecated: true,
            description:
                'Deprecated: Name of the application. This property is ignored. The app name is taken from the URL instead.',
            type: 'string',
            example: 'accounting',
        },
        sdkVersion: {
            deprecated: true,
            description:
                'Deprecated: Which SDK and version the application reporting uses. Typically represented as `<identifier>:<version>`. This is not used in the client_applications db table.',
            type: 'string',
            example: 'unleash-client-java:8.0.0',
        },
        strategies: {
            description:
                'Which [strategies](https://docs.getunleash.io/topics/the-anatomy-of-unleash#activation-strategies) the application has loaded. Useful when trying to figure out if your [custom strategy](https://docs.getunleash.io/reference/custom-activation-strategies) has been loaded in the SDK',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['standard', 'gradualRollout', 'mySpecialCustomStrategy'],
        },
        url: {
            description:
                'A link to reference the application reporting the metrics. Could for instance be a GitHub link to the repository of the application',
            type: 'string',
            example: 'https://github.com/Unleash/unleash-proxy-client-js',
        },
        color: {
            description: `Css color to be used to color the application's entry in the application list`,
            type: 'string',
            example: 'red',
        },
        icon: {
            description: `An URL to an icon file to be used for the applications's entry in the application list`,
            type: 'string',
            example: 'https://github.com/favicon.ico',
        },
    },
    components: {},
} as const;

export type CreateApplicationSchema = FromSchema<
    typeof createApplicationSchema
>;
