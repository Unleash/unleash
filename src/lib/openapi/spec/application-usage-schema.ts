import type { FromSchema } from 'json-schema-to-ts';

export const applicationUsageSchema = {
    $id: '#/components/schemas/applicationUsageSchema',
    type: 'object',
    description: 'Data about an project that have been used by applications.',
    additionalProperties: false,
    required: ['project', 'environments'],
    properties: {
        project: {
            description: 'Name of the project',
            type: 'string',
            example: 'main-project',
        },
        environments: {
            description:
                'Which environments have been accessed in this project.',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['development', 'production'],
        },
    },
    components: {},
} as const;

export type ApplicationUsageSchema = FromSchema<typeof applicationUsageSchema>;
