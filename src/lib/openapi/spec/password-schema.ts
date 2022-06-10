import { FromSchema } from 'json-schema-to-ts';

export const passwordSchema = {
    $id: '#/components/schemas/passwordSchema',
    type: 'object',
    additionalProperties: false,
    required: ['password'],
    properties: {
        password: {
            type: 'string',
        },
        confirmPassword: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type PasswordSchema = FromSchema<typeof passwordSchema>;
