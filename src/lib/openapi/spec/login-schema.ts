import { FromSchema } from 'json-schema-to-ts';

export const loginSchema = {
    $id: '#/components/schemas/loginSchema',
    type: 'object',
    additionalProperties: false,
    required: ['username', 'password'],
    description: 'A username/password login request',
    properties: {
        username: {
            description: 'The username trying to log in',
            type: 'string',
            example: 'user',
        },
        password: {
            description: 'The password of the user trying to log in',
            type: 'string',
            example: 'hunter2',
        },
    },
    components: {},
} as const;

export type LoginSchema = FromSchema<typeof loginSchema>;
