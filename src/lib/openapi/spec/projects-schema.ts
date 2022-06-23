import { FromSchema } from 'json-schema-to-ts';
import { projectSchema } from './project-schema';

export const projectsSchema = {
    $id: '#/components/schemas/projectsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'projects'],
    properties: {
        version: {
            type: 'integer',
        },
        projects: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectSchema',
            },
        },
    },
    components: {
        schemas: {
            projectSchema,
        },
    },
} as const;

export type ProjectsSchema = FromSchema<typeof projectsSchema>;
