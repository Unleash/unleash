import { FromSchema } from 'json-schema-to-ts';

export const publicSignupTokenUpdateSchema = {
    $id: '#/components/schemas/publicSignupTokenUpdateSchema',
    description:
        "Used by Unleash for updating a token's expiration date or, when deleting the invite link, it's status",
    type: 'object',
    additionalProperties: false,
    properties: {
        expiresAt: {
            type: 'string',
            description: `The token's expiration date.`,
            format: 'date-time',
            example: '2023-04-11T15:46:56Z',
        },
        enabled: {
            description: `Whether the token is active or not.`,
            type: 'boolean',
            example: true,
        },
    },
    components: {},
} as const;

export type PublicSignupTokenUpdateSchema = FromSchema<
    typeof publicSignupTokenUpdateSchema
>;
