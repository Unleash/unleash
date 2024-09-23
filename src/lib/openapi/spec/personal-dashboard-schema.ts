import type { FromSchema } from 'json-schema-to-ts';

export const personalDashboardSchema = {
    $id: '#/components/schemas/personalDashboardSchema',
    type: 'object',
    description: 'Project and flags relevant to the user',
    additionalProperties: false,
    required: ['projects', 'flags'],
    properties: {
        projects: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id'],
                properties: {
                    id: {
                        type: 'string',
                        example: 'my-project-id',
                        description: 'The id of the project',
                    },
                },
            },
            description:
                'A list of projects that a user participates in with any role e.g. member or owner or any custom role',
        },
        flags: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['name'],
                properties: {
                    name: {
                        type: 'string',
                        example: 'my-flag',
                        description: 'The name of the flag',
                    },
                },
            },
            description: 'A list of flags a user created or favorited',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type PersonalDashboardSchema = FromSchema<
    typeof personalDashboardSchema
>;
