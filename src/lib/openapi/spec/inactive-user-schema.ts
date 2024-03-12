import type { FromSchema } from 'json-schema-to-ts';

export const inactiveUserSchema = {
    $id: '#/components/schemas/inactiveUserSchema',
    type: 'object',
    additionalProperties: false,
    description: 'A Unleash user that has been flagged as inactive',
    required: ['id'],
    properties: {
        id: {
            description: 'The user id',
            type: 'integer',
            minimum: 0,
            example: 123,
        },
        name: {
            description: 'Name of the user',
            type: 'string',
            example: 'Ned Ryerson',
            nullable: true,
        },
        email: {
            description: 'Email of the user',
            type: 'string',
            example: 'user@example.com',
        },
        username: {
            description: 'A unique username for the user',
            type: 'string',
            example: 'nedryerson',
            nullable: true,
        },
        seenAt: {
            description: 'The last time this user logged in',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-01-25T11:42:00.345Z',
        },
        createdAt: {
            description: 'The user was created at this time',
            type: 'string',
            format: 'date-time',
            example: '2023-12-31T23:59:59.999Z',
        },
        patSeenAt: {
            description: `The last time this user's PAT token (if any) was used`,
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-01-01T23:59:59.999Z',
        },
    },
    components: {},
} as const;

export type InactiveUserSchema = FromSchema<typeof inactiveUserSchema>;
