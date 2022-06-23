import { FromSchema } from 'json-schema-to-ts';
import { roleSchema } from './role-schema';

export const tokenUserSchema = {
    $id: '#/components/schemas/tokenUserSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'email', 'token', 'createdBy', 'role'],
    properties: {
        id: {
            type: 'number',
        },
        name: {
            type: 'string',
        },
        email: {
            type: 'string',
        },
        token: {
            type: 'string',
        },
        createdBy: {
            type: 'string',
            nullable: true,
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
