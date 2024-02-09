import { FromSchema } from 'json-schema-to-ts';
import { projectApplicationInstanceSchema } from './project-application-instance-schema';

export const projectApplicationEnvironmentSchema = {
    $id: '#/components/schemas/projectApplicationEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'instances'],
    description: 'A project application environment.',
    properties: {
        name: {
            type: 'string',
            description:
                'Name of the application that is using the SDK. This is the same as the appName in the SDK configuration.',
        },
        instances: {
            type: 'array',
            description:
                'The instances of the application that are running in the environment',
            items: {
                $ref: '#/components/schemas/projectApplicationInstanceSchema',
            },
        },
    },
    components: {
        projectApplicationInstanceSchema,
    },
} as const;

export type ProjectApplicationEnvironmentSchema = FromSchema<
    typeof projectApplicationEnvironmentSchema
>;
