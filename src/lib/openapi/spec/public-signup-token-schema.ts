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
        'role',
    ],
    properties: {
        secret: {
            type: 'string',
        },
        url: {
            type: 'string',
        },
        name: {
            type: 'string',
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
            items: {
                $ref: '#/components/schemas/userSchema',
            },
            nullable: true,
        },
        role: {
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
