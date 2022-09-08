import { FromSchema } from 'json-schema-to-ts';

export const publicSignupTokenUpdateSchema = {
    $id: '#/components/schemas/publicSignupTokenSchema',
    type: 'object',
    additionalProperties: false,
    required: ['expiresAt'],
    properties: {
        expiresAt: {
            type: 'string',
            format: 'date-time',
        },
    },
    components: {},
} as const;

export type PublicSignupTokenUpdateSchema = FromSchema<
    typeof publicSignupTokenUpdateSchema
>;
