import { FromSchema } from 'json-schema-to-ts';

export const publicSignupTokenUpdateSchema = {
    $id: '#/components/schemas/publicSignupTokenUpdateSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        expiresAt: {
            type: 'string',
            format: 'date-time',
        },
        enabled: {
            type: 'boolean',
        },
    },
    components: {},
} as const;

export type PublicSignupTokenUpdateSchema = FromSchema<
    typeof publicSignupTokenUpdateSchema
>;
