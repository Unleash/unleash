import type { FromSchema } from 'json-schema-to-ts';

export const adminSessionSchema = {
    $id: '#/components/schemas/adminSessionSchema',
    type: 'object',
    additionalProperties: false,
    description: 'An active user session in the Unleash instance.',
    required: ['id', 'userId', 'createdAt', 'expired'],
    properties: {
        id: {
            type: 'string',
            description:
                'An opaque identifier for this session, used to revoke it.',
        },
        userId: {
            type: 'integer',
            description: 'The ID of the user this session belongs to.',
        },
        userName: {
            type: 'string',
            nullable: true,
            description: 'The name of the user.',
        },
        userEmail: {
            type: 'string',
            nullable: true,
            description: 'The email of the user.',
        },
        imageUrl: {
            type: 'string',
            nullable: true,
            description: "The URL of the user's avatar image.",
        },
        seenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'When the user was last active.',
        },
        userAgent: {
            type: 'string',
            nullable: true,
            description:
                'The user agent string of the browser used to create the session.',
        },
        ipAddress: {
            type: 'string',
            nullable: true,
            description:
                'The IP address from which the session was created. Only available for sessions created after IP tracking was enabled.',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the session was created.',
        },
        expired: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'When the session expires.',
        },
    },
    components: {},
} as const;

export type AdminSessionSchema = FromSchema<typeof adminSessionSchema>;
