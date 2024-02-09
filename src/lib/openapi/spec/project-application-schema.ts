import { FromSchema } from 'json-schema-to-ts';
import { projectApplicationEnvironmentSchema } from './project-application-environment-schema';
import { projectApplicationInstanceSchema } from './project-application-instance-schema';

export const projectApplicationSchema = {
    $id: '#/components/schemas/projectApplicationSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'environments'],
    description: 'A project application instance.',
    properties: {
        name: {
            type: 'string',
            description:
                'Name of the application that is using the SDK. This is the same as the appName in the SDK configuration.',
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-01-28T15:21:39.975Z',
            description: 'The last time the application was seen.',
        },
        environments: {
            type: 'array',
            description: 'The environments that the application is running in.',
            items: {
                $ref: '#/components/schemas/projectApplicationEnvironmentSchema',
            },
        },
    },
    components: {
        projectApplicationEnvironmentSchema,
        projectApplicationInstanceSchema,
    },
} as const;

export type ProjectApplicationSchema = FromSchema<
    typeof projectApplicationSchema
>;
