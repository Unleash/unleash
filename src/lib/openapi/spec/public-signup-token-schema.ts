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
            type: 'string',
        },
        url: {
            description:
                'The public signup link for the token. Users who follow this link will be taken to a signup page where they can create an Unleash user.',
            type: 'string',
        },
        name: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
        createdBy: {
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
