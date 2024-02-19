import { FromSchema } from 'json-schema-to-ts';
import { AccountTypes } from '../../types';

export const userSchema = {
    $id: '#/components/schemas/userSchema',
    type: 'object',
    additionalProperties: false,
    description: 'An Unleash user',
    required: ['id'],
    properties: {
        id: {
            description: 'The user id',
            type: 'integer',
            example: 123,
        },
        isAPI: {
            description:
                '(Deprecated): Used internally to know which operations the user should be allowed to perform',
            type: 'boolean',
            example: true,
            deprecated: true,
        },
        name: {
            description: 'Name of the user',
            type: 'string',
            example: 'User',
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
            example: 'hunter',
            nullable: true,
        },
        imageUrl: {
            description: `URL used for the userprofile image`,
            type: 'string',
            example: 'https://example.com/242x200.png',
        },
        inviteLink: {
            description: `If the user is actively inviting other users, this is the link that can be shared with other users`,
            type: 'string',
            example: 'http://localhost:4242/invite-link/some-secret',
        },
        loginAttempts: {
            description:
                'How many unsuccessful attempts at logging in has the user made',
            type: 'integer',
            minimum: 0,
            example: 3,
        },
        emailSent: {
            description: 'Is the welcome email sent to the user or not',
            type: 'boolean',
            example: false,
        },
        rootRole: {
            description:
                'Which [root role](https://docs.getunleash.io/reference/rbac#predefined-roles) this user is assigned',
            type: 'integer',
            example: 1,
            minimum: 0,
        },
        seenAt: {
            description: 'The last time this user logged in',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-06-30T11:42:00.345Z',
        },
        createdAt: {
            description: 'The user was created at this time',
            type: 'string',
            format: 'date-time',
            example: '2023-06-30T11:41:00.123Z',
        },
        accountType: {
            description: 'A user is either an actual User or a Service Account',
            type: 'string',
            enum: AccountTypes,
            example: 'User',
        },
        permissions: {
            description: 'Deprecated',
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {},
} as const;

export type UserSchema = FromSchema<typeof userSchema>;
