import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';
import { roleSchema } from './role-schema';

export const publicSignupTokenSchema = {
    $id: '#/components/schemas/publicSignupTokenSchema',
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
            description: 'The token',
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
            description: "The token's name",
            type: 'string',
            example: 'default',
        },
        enabled: {
            description: 'Whether the token is active',
            type: 'boolean',
            example: true,
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-04-12T11:13:31.960Z',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-04-12T11:13:31.960Z',
        },
        createdBy: {
            description: 'The user that created the token',
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
