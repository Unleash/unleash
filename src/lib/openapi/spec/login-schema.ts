import { FromSchema } from 'json-schema-to-ts';

export const loginSchema = {
    $id: '#/components/schemas/loginSchema',
    type: 'object',
    additionalProperties: false,
    required: ['username', 'password'],
    properties: {
        username: {
            type: 'string',
        },
        password: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type LoginSchema = FromSchema<typeof loginSchema>;
