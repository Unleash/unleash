import type { FromSchema } from 'json-schema-to-ts';
import { projectActivitySchema } from './project-activity-schema';

export const projectStatusSchema = {
    $id: '#/components/schemas/projectStatusSchema',
    type: 'object',
    additionalProperties: false,
    required: ['activityCountByDate', 'resources'],
    description:
        'Schema representing the overall status of a project, including an array of activity records. Each record in the activity array contains a date and a count, providing a snapshot of the project’s activity level over time.',
    properties: {
        activityCountByDate: {
            $ref: '#/components/schemas/projectActivitySchema',
            description:
                'Array of activity records with date and count, representing the project’s daily activity statistics.',
        },
        resources: {
            type: 'object',
            additionalProperties: false,
            required: [
                'connectedEnvironments',
                'apiTokens',
                'members',
                'segments',
            ],
            description: 'Key resources within the project',
            properties: {
                connectedEnvironments: {
                    type: 'number',
                    minimum: 0,
                    description:
                        'The number of environments that have received SDK traffic in this project.',
                },
                apiTokens: {
                    type: 'number',
                    description:
                        'The number of environments that have received SDK traffic in this project.',
                },
                members: {
                    type: 'number',
                    description:
                        'The number of environments that have received SDK traffic in this project.',
                },
                segments: {
                    type: 'number',
                    description:
                        'The number of environments that have received SDK traffic in this project.',
                },
            },
        },
    },
    components: {
        schemas: {
            projectActivitySchema,
        },
    },
} as const;

export type ProjectStatusSchema = FromSchema<typeof projectStatusSchema>;
