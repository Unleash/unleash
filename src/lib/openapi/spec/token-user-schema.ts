import { FromSchema } from 'json-schema-to-ts';
import { roleSchema } from './role-schema';

export const tokenUserSchema = {
    $id: '#/components/schemas/tokenUserSchema',
    type: 'object',
    additionalProperties: false,
    required: ['createdBy', 'token', 'role'],
    properties: {
        createdBy: {
            type: 'string',
        },
        token: {
            type: 'string',
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
