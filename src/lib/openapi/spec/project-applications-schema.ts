import { FromSchema } from 'json-schema-to-ts';
import { projectApplicationSchema } from './project-application-schema';
import { projectApplicationInstanceSchema } from './project-application-instance-schema';
import { projectApplicationEnvironmentSchema } from './project-application-environment-schema';

export const projectApplicationsSchema = {
    $id: '#/components/schemas/projectApplicationsSchema',
    type: 'array',
    description: 'A list of project applications',
    items: {
        $ref: '#/components/schemas/projectApplicationSchema',
    },
    components: {
        schemas: {
            projectApplicationSchema,
            projectApplicationInstanceSchema,
            projectApplicationEnvironmentSchema,
        },
    },
} as const;

export type ProjectApplicationsSchema = FromSchema<
    typeof projectApplicationsSchema
>;
