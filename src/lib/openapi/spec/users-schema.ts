import type { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';
import { roleSchema } from './role-schema';

export const usersSchema = {
    $id: '#/components/schemas/usersSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Users and root roles',
    required: ['users'],
    properties: {
        users: {
            type: 'array',
            description: 'A list of users in the Unleash instance.',
            items: {
                $ref: '#/components/schemas/userSchema',
            },
        },
        rootRoles: {
            type: 'array',
            description:
                'A list of [root roles](https://docs.getunleash.io/reference/rbac#predefined-roles) in the Unleash instance.',
            items: {
                $ref: '#/components/schemas/roleSchema',
            },
        },
    },
    components: {
        schemas: {
            userSchema,
            roleSchema,
        },
    },
} as const;

export type UsersSchema = FromSchema<typeof usersSchema>;
