import { FromSchema } from 'json-schema-to-ts';

export const publicSignupTokenCreateSchema = {
    $id: '#/components/schemas/publicSignupTokenCreateSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'expiresAt'],
    properties: {
        name: {
            type: 'string',
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
        },
    },
    components: {},
} as const;

export type PublicSignupTokenCreateSchema = FromSchema<
    typeof publicSignupTokenCreateSchema
>;
