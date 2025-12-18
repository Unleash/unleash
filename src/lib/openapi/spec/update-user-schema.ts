import type { FromSchema } from 'json-schema-to-ts';

export const updateUserSchema = {
    $id: '#/components/schemas/updateUserSchema',
    type: 'object',
    description: 'All fields that can be directly changed for the user',
    properties: {
        email: {
            description:
                "The user's email address. Must be provided if username is not provided.",
            type: 'string',
            example: 'user@example.com',
        },
        name: {
            description: "The user's name (not the user's username).",
            type: 'string',
            example: 'Sam Seawright',
        },
        rootRole: {
            description:
                "The role to assign to the user. Can be either the role's ID or its unique name.",
            oneOf: [
                {
                    type: 'integer',
                    example: 1,
                    minimum: 0,
                },
                {
                    type: 'string',
                    example: 'Admin',
                    enum: [
                        'Admin',
                        'Editor',
                        'Viewer',
                        'Owner',
                        'Member',
                        'Reader',
                    ],
                },
            ],
        },
    },
    components: {},
} as const;

export type UpdateUserSchema = FromSchema<typeof updateUserSchema>;
