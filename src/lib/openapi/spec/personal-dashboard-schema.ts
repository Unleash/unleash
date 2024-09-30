import type { FromSchema } from 'json-schema-to-ts';

export const personalDashboardSchema = {
    $id: '#/components/schemas/personalDashboardSchema',
    type: 'object',
    description: 'Project and flags relevant to the user',
    additionalProperties: false,
    required: ['projects', 'flags'],
    properties: {
        projectOwners: {
            type: 'array',
            description:
                'Users with the project owner role in Unleash. Only contains owners of projects that are visible to the user.',
            items: {
                type: 'object',
                required: ['ownerType', 'name'],
                properties: {
                    ownerType: {
                        type: 'string',
                        enum: ['user'],
                    },
                    name: {
                        type: 'string',
                        example: 'User Name',
                    },
                    imageUrl: {
                        type: 'string',
                        nullable: true,
                        example: 'https://example.com/image.jpg',
                    },
                    email: {
                        type: 'string',
                        nullable: true,
                        example: 'user@example.com',
                    },
                },
            },
        },
        projects: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: [
                    'id',
                    'name',
                    'health',
                    'memberCount',
                    'featureCount',
                ],
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
                    health: {
                        type: 'number',
                        example: 50,
                        description:
                            "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#health-rating) on a scale from 0 to 100",
                    },
                    memberCount: {
                        type: 'number',
                        example: 4,
                        description: 'The number of members this project has',
                    },
                    featureCount: {
                        type: 'number',
                        example: 10,
                        description: 'The number of features this project has',
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
