import { FromSchema } from 'json-schema-to-ts';

export const resetPasswordSchema = {
    $id: '#/components/schemas/resetPasswordSchema',
    type: 'object',
    additionalProperties: false,
    required: ['resetPasswordUrl'],
    properties: {
        resetPasswordUrl: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type ResetPasswordSchema = FromSchema<typeof resetPasswordSchema>;
