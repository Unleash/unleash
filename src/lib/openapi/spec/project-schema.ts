import type { FromSchema } from 'json-schema-to-ts';

export const projectSchema = {
    $id: '#/components/schemas/projectSchema',
    type: 'object',
    // additionalProperties: false, // todo: re-enable when flag projectListImprovements is removed
    required: ['id', 'name'],
    description:
        'A definition of the project used for projects listing purposes',
    properties: {
        id: {
            type: 'string',
            example: 'dx-squad',
            description: 'The id of this project',
        },
        name: {
            type: 'string',
            example: 'DX-Squad',
            description: 'The name of this project',
        },
        description: {
            deprecated: true,
            type: 'string',
            nullable: true,
            example: 'DX squad feature release',
            description: 'Additional information about the project',
        },
        health: {
            type: 'number',
            example: 50,
            description:
                "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#health-rating) on a scale from 0 to 100",
        },
        featureCount: {
            type: 'number',
            example: 10,
            description: 'The number of features this project has',
        },
        staleFeatureCount: {
            deprecated: true,
            type: 'number',
            example: 10,
            description: 'The number of stale features this project has',
        },
        potentiallyStaleFeatureCount: {
            deprecated: true,
            type: 'number',
            example: 10,
            description:
                'The number of potentially stale features this project has',
        },
        memberCount: {
            type: 'number',
            example: 4,
            description: 'The number of members this project has',
        },
        createdAt: {
            type: 'string',
            description: 'When this project was created.',
            example: '2023-07-27T12:12:28Z',
            format: 'date-time',
        },
        updatedAt: {
            deprecated: true,
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'When this project was last updated.',
            example: '2023-07-28T12:12:28Z',
        },
        archivedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'When this project was archived.',
            example: '2023-07-28T12:12:28Z',
        },
        favorite: {
            type: 'boolean',
            example: true,
            description:
                '`true` if the project was favorited, otherwise `false`.',
        },
        mode: {
            type: 'string',
            enum: ['open', 'protected', 'private'],
            example: 'open',
            description:
                "The project's [collaboration mode](https://docs.getunleash.io/reference/project-collaboration-mode). Determines whether non-project members can submit change requests or not.",
        },
        defaultStickiness: {
            deprecated: true,
            type: 'string',
            example: 'userId',
            description:
                'A default stickiness for the project affecting the default stickiness value for variants and Gradual Rollout strategy',
        },
        avgTimeToProduction: {
            deprecated: true,
            type: 'number',
            example: 10,
            description:
                'The average time from when a feature was created to when it was enabled in the "production" environment during the current window',
        },
        owners: {
            description:
                'The users and/or groups that have the "owner" role in this project. If no such users or groups exist, the list will contain the "system" owner instead.',
            oneOf: [
                {
                    type: 'array',
                    minItems: 1,
                    items: {
                        anyOf: [
                            {
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
                                        example:
                                            'https://example.com/image.jpg',
                                    },
                                    email: {
                                        type: 'string',
                                        nullable: true,
                                        example: 'user@example.com',
                                    },
                                },
                            },
                            {
                                type: 'object',
                                required: ['ownerType', 'name'],
                                properties: {
                                    ownerType: {
                                        type: 'string',
                                        enum: ['group'],
                                    },
                                    name: {
                                        type: 'string',
                                        example: 'Group Name',
                                    },
                                },
                            },
                        ],
                    },
                },
                {
                    type: 'array',
                    minItems: 1,
                    maxItems: 1,
                    items: {
                        type: 'object',
                        required: ['ownerType'],
                        properties: {
                            ownerType: {
                                type: 'string',
                                enum: ['system'],
                            },
                        },
                    },
                },
            ],
        },
    },
    components: {},
} as const;

export type ProjectSchema = FromSchema<typeof projectSchema>;
