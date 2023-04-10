import { FromSchema } from 'json-schema-to-ts';

export const publicSignupTokenUpdateSchema = {
    $id: '#/components/schemas/publicSignupTokenUpdateSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        expiresAt: {
            type: 'string',
            description: `The token's expiration date.`,
            format: 'date-time',
        },
        enabled: {
            description: `Whether the token is active or not.`,
            type: 'boolean',
            exanmple: true,
        },
    },
    components: {},
} as const;

export type PublicSignupTokenUpdateSchema = FromSchema<
    typeof publicSignupTokenUpdateSchema
>;
