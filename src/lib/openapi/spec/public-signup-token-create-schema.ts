import { FromSchema } from 'json-schema-to-ts';

export const publicSignupTokenCreateSchema = {
    $id: '#/components/schemas/publicSignupTokenCreateSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'expiresAt'],
    properties: {
        name: {
            description: `The token's name.`,
            type: 'string',
        },
        expiresAt: {
            type: 'string',
            description: `The token's expiration date.`,
            format: 'date-time',
        },
    },
    components: {},
} as const;

export type PublicSignupTokenCreateSchema = FromSchema<
    typeof publicSignupTokenCreateSchema
>;
