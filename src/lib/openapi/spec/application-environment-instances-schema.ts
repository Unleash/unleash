import type { FromSchema } from 'json-schema-to-ts';

export const applicationEnvironmentInstancesSchema = {
    $id: '#/components/schemas/applicationEnvironmentInstanceSchema',
    type: 'object',
    description:
        'Data about an application environment instances that are connected to Unleash via an SDK.',
    additionalProperties: false,
    required: ['instances'],
    properties: {
        instances: {
            type: 'array',
            description: 'A list of instances',
            items: {
                type: 'object',
                required: ['instanceId'],
                additionalProperties: false,
                properties: {
                    instanceId: {
                        description:
                            'A unique identifier identifying the instance of the application running the SDK. Often changes based on execution environment. For instance: two pods in Kubernetes will have two different instanceIds',
                        type: 'string',
                        example: 'b77f3d13-5f48-4a7b-a3f4-a449b97ce43a',
                    },
                    sdkVersion: {
                        type: 'string',
                        nullable: true,
                        description:
                            'An SDK version identifier. Usually formatted as "unleash-client-<language>:<version>"',
                        example: 'unleash-client-java:7.0.0',
                    },
                    clientIp: {
                        type: 'string',
                        description:
                            'An IP address identifying the instance of the application running the SDK',
                        example: '192.168.0.1',
                        nullable: true,
                    },
                    lastSeen: {
                        type: 'string',
                        format: 'date-time',
                        example: '2023-04-19T08:15:14.000Z',
                        description:
                            'The last time the application environment instance was seen',
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type ApplicationEnvironmentInstancesSchema = FromSchema<
    typeof applicationEnvironmentInstancesSchema
>;
