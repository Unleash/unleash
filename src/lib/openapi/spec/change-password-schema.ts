import { FromSchema } from 'json-schema-to-ts';

export const changePasswordSchema = {
    $id: '#/components/schemas/changePasswordSchema',
    type: 'object',
    additionalProperties: false,
    required: ['token', 'password'],
    properties: {
        token: {
            type: 'string',
        },
        password: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type ChangePasswordSchema = FromSchema<typeof changePasswordSchema>;
