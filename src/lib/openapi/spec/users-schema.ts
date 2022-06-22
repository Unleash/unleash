import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';
import { roleSchema } from './role-schema';

export const usersSchema = {
    $id: '#/components/schemas/usersSchema',
    type: 'object',
    additionalProperties: false,
    required: ['users'],
    properties: {
        users: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/userSchema',
            },
        },
        rootRoles: {
            type: 'array',
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
