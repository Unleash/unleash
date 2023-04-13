import { FromSchema } from 'json-schema-to-ts';
import { dateSchema } from './date-schema';

export const bulkRegistrationSchema = {
    $id: '#/components/schemas/bulkRegistrationSchema',
    type: 'object',
    required: ['appName', 'instanceId'],
    properties: {
        connectVia: {
            type: 'array',
            description:
                'A list of applications this app registration has been registered through or empty',
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
            example: ['unleash-edge'],
        },
        appName: {
            description:
                'The name of the application that is evaluating toggles',
            type: 'string',
            example: 'Ingress load balancer',
        },
        environment: {
            description: 'Which environment is the application running in',
            type: 'string',
            example: 'development',
        },
        instanceId: {
            description: 'A unique identifier for the application',
            type: 'string',
            example: 'Random UUID',
        },
        interval: {
            description:
                'How often (in seconds) does the application refresh its features',
            type: 'number',
            example: 10,
        },
        started: {
            description: 'When did the application start',
            example: '1952-03-11T12:00:00.000Z', //GNU Douglas Adams
            $ref: '#/components/schemas/dateSchema',
        },
        strategies: {
            description:
                'Which [strategies](https://docs.getunleash.io/reference/activation-strategies) are enabled in the application',
            type: 'array',
            example: ['standard', 'gradualRollout'],
            items: {
                type: 'string',
            },
        },
        sdkVersion: {
            summary: 'Version identifier for the SDK used',
            description: 'Typically <client>:<version>',
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
