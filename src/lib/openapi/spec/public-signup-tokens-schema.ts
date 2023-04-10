import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';
import { roleSchema } from './role-schema';
import { publicSignupTokenSchema } from './public-signup-token-schema';

export const publicSignupTokensSchema = {
    $id: '#/components/schemas/publicSignupTokensSchema',
    type: 'object',
    additionalProperties: false,
    required: ['tokens'],
    properties: {
        tokens: {
            type: 'array',
            description: 'An array of all the public signup tokens',
            items: {
                $ref: '#/components/schemas/publicSignupTokenSchema',
            },
        },
    },
    components: {
        schemas: {
            publicSignupTokenSchema,
            userSchema,
            roleSchema,
        },
    },
} as const;

export type PublicSignupTokensSchema = FromSchema<
    typeof publicSignupTokensSchema
>;
