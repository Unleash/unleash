import { FromSchema } from 'json-schema-to-ts';

export const resetPasswordSchema = {
    $id: '#/components/schemas/resetPasswordSchema',
    type: 'object',
    additionalProperties: false,
    required: ['email'],
    properties: {
        email: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type ResetPasswordSchema = FromSchema<typeof resetPasswordSchema>;
