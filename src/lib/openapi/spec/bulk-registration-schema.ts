import { FromSchema } from 'json-schema-to-ts';
import { dateSchema } from './date-schema';

export const bulkRegistrationSchema = {
    $id: '#/components/schemas/bulkRegistrationSchema',
    type: 'object',
    required: ['appName', 'instanceId', 'environment'],
    description: `An application registration. Defines the format POSTed by our server-side SDKs when they're starting up`,
    properties: {
        connectVia: {
            type: 'array',
            description:
                'A list of applications this app registration has been registered through. If connected directly to Unleash, this is an empty list. \n This can be used in later visualizations to tell how many levels of proxy or Edge instances our SDKs have connected through',
            items: {
                type: 'object',
                required: ['appName', 'instanceId'],
                properties: {
                    appName: {
                        type: 'string',
                    },
                    instanceId: {
                        type: 'string',
                    },
                },
            },
            example: [
                { appName: 'unleash-edge', instanceId: 'edge-pod-bghzv5' },
            ],
        },
        appName: {
            description:
                'The name of the application that is evaluating toggles',
            type: 'string',
            example: 'Ingress load balancer',
        },
        environment: {
            description: 'Which environment the application is running in',
            type: 'string',
            example: 'development',
        },
        instanceId: {
            description:
                'A [(somewhat) unique identifier](https://docs.getunleash.io/reference/sdks/node#advanced-usage) for the application',
            type: 'string',
            example: 'application-name-dacb1234',
        },
        interval: {
            description:
                'How often (in seconds) the application refreshes its features',
            type: 'number',
            example: 10,
        },
        started: {
            description: 'The application started at',
            example: '1952-03-11T12:00:00.000Z', //GNU Douglas Adams
            $ref: '#/components/schemas/dateSchema',
        },
        strategies: {
            description:
                'Enabled [strategies](https://docs.getunleash.io/reference/activation-strategies) in the application',
            type: 'array',
            example: ['standard', 'gradualRollout'],
            items: {
                type: 'string',
            },
        },
        sdkVersion: {
            description:
                'The version the sdk is running. Typically <client>:<version>',
            example: 'unleash-client-java:8.0.0',
            type: 'string',
        },
    },
    components: {
        schemas: {
            dateSchema,
        },
    },
} as const;

export type BulkRegistrationSchema = FromSchema<typeof bulkRegistrationSchema>;
