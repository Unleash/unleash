import type { FromSchema } from 'json-schema-to-ts';
import { projectSchema } from './project-schema';

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
                required: ['id', 'name', 'roles'],
                properties: {
                    id: {
                        type: 'string',
                        example: 'my-project-id',
                        description: 'The id of the project',
                    },
                    name: {
                        type: 'string',
                        example: 'My Project',
                        description: 'The name of the project',
                    },
                    owners: projectSchema.properties.owners,
                    roles: {
                        type: 'array',
                        description:
                            'The list of roles that the user has in this project.',
                        minItems: 1,
                        items: {
                            type: 'object',
                            description: 'An Unleash role.',
                            additionalProperties: false,
                            required: ['name', 'id', 'type'],
                            properties: {
                                name: {
                                    type: 'string',
                                    example: 'Owner',
                                    description: 'The name of the role',
                                },
                                id: {
                                    type: 'integer',
                                    example: 4,
                                    description: 'The id of the role',
                                },
                                type: {
                                    type: 'string',
                                    enum: [
                                        'custom',
                                        'project',
                                        'root',
                                        'custom-root',
                                    ],
                                    example: 'project',
                                    description: 'The type of the role',
                                },
                            },
                        },
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
                required: ['name', 'project', 'type'],
                properties: {
                    name: {
                        type: 'string',
                        example: 'my-flag',
                        description: 'The name of the flag',
                    },
                    project: {
                        type: 'string',
                        example: 'my-project-id',
                        description: 'The id of the feature project',
                    },
                    type: {
                        type: 'string',
                        example: 'release',
                        description: 'The type of the feature flag',
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
