import type { FromSchema } from 'json-schema-to-ts';

export const userAccessLogEntrySchema = {
    $id: '#/components/schemas/userAccessLogEntrySchema',
    type: 'object',
    additionalProperties: false,
    description:
        'A single entry in the user access log, describing when a user was added to and/or removed from the Unleash instance.',
    required: ['id', 'status'],
    properties: {
        id: {
            description: 'The id of the user this entry describes.',
            type: 'integer',
            example: 123,
        },
        name: {
            description: 'The name of the user.',
            type: 'string',
            nullable: true,
            example: 'Ned Ryerson',
        },
        username: {
            description: 'The username of the user.',
            type: 'string',
            nullable: true,
            example: 'nedryerson',
        },
        email: {
            description: 'The email of the user.',
            type: 'string',
            nullable: true,
            example: 'user@example.com',
        },
        imageUrl: {
            description:
                'The URL of the user profile image. Only available while the user still exists.',
            type: 'string',
            nullable: true,
            example:
                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3',
        },
        status: {
            description:
                'Whether the user is currently added to the instance, or has been removed.',
            type: 'string',
            enum: ['added', 'removed'],
            example: 'added',
        },
        createdAt: {
            description: 'When the user was added to the instance.',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-12-31T23:59:59.999Z',
        },
        removedAt: {
            description:
                'When the user was removed from the instance. Null if the user is still active.',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-01-25T11:42:00.345Z',
        },
        roleName: {
            description:
                'The root role name of the user. For active users this is their current role; for removed users it is the role they had when they were removed. Null if it could not be resolved.',
            type: 'string',
            nullable: true,
            example: 'Admin',
        },
        performedBy: {
            description:
                'The user who performed the last action on this user (removal if removed, otherwise creation).',
            type: 'object',
            nullable: true,
            additionalProperties: false,
            required: ['id', 'name', 'imageUrl'],
            properties: {
                id: {
                    description: 'The id of the acting user, if known.',
                    type: 'integer',
                    nullable: true,
                    example: 1,
                },
                name: {
                    description: 'The name of the acting user, if known.',
                    type: 'string',
                    nullable: true,
                    example: 'Admin',
                },
                imageUrl: {
                    description:
                        'The profile image URL of the acting user, if known.',
                    type: 'string',
                    nullable: true,
                    example:
                        'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3',
                },
            },
        },
    },
    components: {},
} as const;

export type UserAccessLogEntrySchema = FromSchema<
    typeof userAccessLogEntrySchema
>;
