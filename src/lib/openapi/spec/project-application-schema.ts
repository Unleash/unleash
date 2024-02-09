import { FromSchema } from 'json-schema-to-ts';

export const projectApplicationSchema = {
    $id: '#/components/schemas/projectApplicationSchema',
    type: 'object',
    additionalProperties: false,
    required: ['appName', 'instanceId', 'sdkVersion', 'environment'],
    description: 'A project application instance.',
    properties: {
        appName: {
            type: 'string',
            description:
                'Name of the application that is using the SDK. This is the same as the appName in the SDK configuration.',
        },
        instanceId: {
            type: 'string',
            description:
                'The unique identifier of the application instance. This is the same as the instanceId in the SDK configuration',
        },
        sdkVersion: {
            type: 'string',
            description:
                'The version of the SDK that is being used by the application',
        },
        environment: {
            type: 'string',
            description:
                'The environment that the application is running in. This is coming from token configured in the SDK configuration.',
        },
    },
    components: {},
} as const;

export type ProjectApplicationSchema = FromSchema<
    typeof projectApplicationSchema
>;
