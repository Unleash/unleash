import type { FromSchema } from 'json-schema-to-ts';
import { projectApplicationSdkSchema } from './project-application-sdk-schema.js';

export const projectApplicationSchema = {
    $id: '#/components/schemas/projectApplicationSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'environments', 'instances', 'sdks'],
    description: 'A project application instance.',
    properties: {
        name: {
            type: 'string',
            description:
                'Name of the application that is using the SDK. This is the same as the appName in the SDK configuration.',
        },
        environments: {
            description:
                'The environments that the application is using. This is the same as the environment in the SDK configuration.',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['development', 'production'],
        },
        instances: {
            description:
                'The instances of the application that are using the SDK.',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['prod-b4ca', 'prod-ac8a'],
        },
        sdks: {
            type: 'array',
            description: 'The SDKs that the application is using.',
            items: {
                $ref: '#/components/schemas/projectApplicationSdkSchema',
            },
        },
    },
    components: { projectApplicationSdkSchema },
} as const;

export type ProjectApplicationSchema = FromSchema<
    typeof projectApplicationSchema
>;
