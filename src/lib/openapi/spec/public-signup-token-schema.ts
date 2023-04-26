import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';
import { roleSchema } from './role-schema';

export const publicSignupTokenSchema = {
    $id: '#/components/schemas/publicSignupTokenSchema',
    description:
        'Used for transporting a [public invite link](https://docs.getunleash.io/reference/public-signup#public-sign-up-tokens)',
    type: 'object',
    additionalProperties: false,
    required: [
        'secret',
        'url',
        'name',
        'expiresAt',
        'createdAt',
        'createdBy',
        'enabled',
        'role',
    ],
    properties: {
        secret: {
            description:
                'The actual value of the token. This is the part that is used by Unleash to create an invite link',
            type: 'string',
            example: 'a3c84b25409ea8ca1782ef17f94a42fc',
        },
        url: {
            description:
                'The public signup link for the token. Users who follow this link will be taken to a signup page where they can create an Unleash user.',
            type: 'string',
            example:
                'https://sandbox.getunleash.io/enterprise/new-user?invite=a3c84b25409ea8ca1782ef17f94a42fc',
        },
        name: {
            description: "The token's name. Only for displaying in the UI",
            type: 'string',
            example: 'Invite public viewers',
        },
        enabled: {
            description:
                'Whether the token is active. This property will always be `false` for a token that has expired.',
            type: 'boolean',
            example: true,
        },
        expiresAt: {
            type: 'string',
            description: 'The time when the token will expire.',
            format: 'date-time',
            example: '2023-04-12T11:13:31.960Z',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the token was created.',
            example: '2023-04-12T11:13:31.960Z',
        },
        createdBy: {
            description: "The creator's email or username",
            example: 'someone@example.com',
            type: 'string',
            nullable: true,
        },
        users: {
            type: 'array',
            description: 'Array of users that have signed up using the token.',
            items: {
                $ref: '#/components/schemas/userSchema',
            },
            nullable: true,
        },
        role: {
            description:
                'Users who sign up using this token will be given this role.',
            $ref: '#/components/schemas/roleSchema',
        },
    },
    components: {
        schemas: {
            userSchema,
            roleSchema,
        },
    },
} as const;

export type PublicSignupTokenSchema = FromSchema<
    typeof publicSignupTokenSchema
>;
