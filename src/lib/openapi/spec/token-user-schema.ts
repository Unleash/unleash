import type { FromSchema } from 'json-schema-to-ts';
import { roleSchema } from './role-schema.js';

export const tokenUserSchema = {
    $id: '#/components/schemas/tokenUserSchema',
    type: 'object',
    additionalProperties: false,
    description: 'A user identified by a token',
    required: ['id', 'email', 'token', 'createdBy', 'role'],
    properties: {
        id: {
            type: 'integer',
            description: 'The user id',
            example: 7,
        },
        name: {
            description: 'The name of the user',
            type: 'string',
            example: 'Test McTest',
        },
        email: {
            description: 'The email of the user',
            type: 'string',
            example: 'test@example.com',
        },
        token: {
            description: 'A token uniquely identifying a user',
            type: 'string',
            example: 'user:xyzrandomstring',
        },
        createdBy: {
            description:
                'A username or email identifying which user created this token',
            type: 'string',
            nullable: true,
            example: 'admin@example.com',
        },
        role: {
            $ref: '#/components/schemas/roleSchema',
        },
    },
    components: {
        schemas: {
            roleSchema,
        },
    },
} as const;

export type TokenUserSchema = FromSchema<typeof tokenUserSchema>;
