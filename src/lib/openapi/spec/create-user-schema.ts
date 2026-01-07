import type { FromSchema } from 'json-schema-to-ts';

export const createUserSchema = {
    $id: '#/components/schemas/createUserSchema',
    type: 'object',
    additionalProperties: false,
    required: ['rootRole'],
    description:
        'The payload must contain at least one of the name and email properties, though which one is up to you. For the user to be able to log in to the system, the user must have an email.',
    properties: {
        username: {
            description:
                "The user's username. Must be provided if email is not provided.",
            type: 'string',
            example: 'hunter',
        },
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
        password: {
            type: 'string',
            example: 'k!5As3HquUrQ',
            description: 'Password for the user',
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
        sendEmail: {
            type: 'boolean',
            example: false,
            description:
                'Whether to send a welcome email with a login link to the user or not. Defaults to `true`.',
        },
    },
    components: {},
} as const;

export type CreateUserSchema = FromSchema<typeof createUserSchema>;
