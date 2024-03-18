import type { FromSchema } from 'json-schema-to-ts';

export const resetPasswordSchema = {
    $id: '#/components/schemas/resetPasswordSchema',
    type: 'object',
    description: 'Data used to provide users a way to reset their passwords.',
    additionalProperties: false,
    required: ['resetPasswordUrl'],
    properties: {
        resetPasswordUrl: {
            description:
                'A URL pointing to a location where the user can reset their password',
            type: 'string',
            format: 'uri',
            example: 'https://unleash.reset.com',
        },
    },
    components: {},
} as const;

export type ResetPasswordSchema = FromSchema<typeof resetPasswordSchema>;
