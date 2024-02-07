import { FromSchema } from 'json-schema-to-ts';
import { projectApplicationSchema } from './project-application-schema';

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
        },
    },
} as const;

export type ProjectApplicationsSchema = FromSchema<
    typeof projectApplicationsSchema
>;
