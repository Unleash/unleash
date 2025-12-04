import type { FromSchema } from 'json-schema-to-ts';

export const personalDashboardSchema = {
    $id: '#/components/schemas/personalDashboardSchema',
    type: 'object',
    description: 'Project and flags relevant to the user',
    additionalProperties: false,
    required: ['projects', 'flags', 'admins', 'projectOwners'],
    properties: {
        admins: {
            type: 'array',
            description: 'Users with the admin role in Unleash.',
            items: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'integer',
                        description: 'The user ID.',
                        example: 1,
                    },
                    name: {
                        type: 'string',
                        description: "The user's name.",
                        example: 'Ash Ketchum',
                    },
                    username: {
                        type: 'string',
                        description: "The user's username.",
                        example: 'pokémaster13',
                    },
                    imageUrl: {
                        type: 'string',
                        example: 'https://example.com/peek-at-you.jpg',
                    },
                    email: {
                        type: 'string',
                        example: 'user@example.com',
                    },
                },
            },
        },
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
                        description:
                            'The type of the owner; will always be `user`.',
                    },
                    name: {
                        type: 'string',
                        example: 'User Name',
                        description:
                            "The name displayed for the user. Can be the user's name, username, or email, depending on what they have provided.",
                    },
                    imageUrl: {
                        type: 'string',
                        nullable: true,
                        description: "The URL of the user's profile image.",
                        example: 'https://example.com/image.jpg',
                    },
                    email: {
                        type: 'string',
                        nullable: true,
                        description: "The user's email address.",
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
                    'technicalDebt',
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
                        type: 'integer',
                        example: 50,
                        minimum: 0,
                        deprecated: true,
                        description: 'Use `technicalDebt` instead.',
                    },
                    technicalDebt: {
                        type: 'integer',
                        example: 25,
                        minimum: 0,
                        maximum: 100,
                        description:
                            "An indicator of the [project's technical debt](https://docs.getunleash.io/concepts/technical-debt#project-status) on a scale from 0 to 100",
                    },
                    memberCount: {
                        type: 'integer',
                        example: 4,
                        minimum: 0,
                        description: 'The number of members this project has',
                    },
                    featureCount: {
                        type: 'integer',
                        example: 10,
                        minimum: 0,
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
