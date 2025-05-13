import type { FromSchema } from 'json-schema-to-ts';
import { projectApplicationSchema } from './project-application-schema.js';
import { projectApplicationSdkSchema } from './project-application-sdk-schema.js';

export const projectApplicationsSchema = {
    $id: '#/components/schemas/projectApplicationsSchema',
    type: 'object',
    description: 'A list of project applications',
    required: ['total', 'applications'],
    properties: {
        total: {
            type: 'integer',
            example: 50,
            description: 'The total number of project applications.',
        },
        applications: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectApplicationSchema',
            },
            description: 'All applications defined for a specific project.',
        },
    },
    components: {
        schemas: {
            projectApplicationSchema,
            projectApplicationSdkSchema,
        },
    },
} as const;

export type ProjectApplicationsSchema = FromSchema<
    typeof projectApplicationsSchema
>;
