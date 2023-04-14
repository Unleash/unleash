import { FromSchema } from 'json-schema-to-ts';
import { edgeTokenSchema } from './edge-token-schema';

export const validatedEdgeTokensSchema = {
    $id: '#/components/schemas/validatedEdgeTokensSchema',
    type: 'object',
    additionalProperties: false,
    required: ['tokens'],
    description: `A object containing a list of valid Unleash tokens.`,
    properties: {
        tokens: {
            description:
                'The list of Unleash token objects. Each object contains the token itself and some additional metadata.',
            type: 'array',
            items: { $ref: '#/components/schemas/edgeTokenSchema' },
        },
    },
    components: {
        schemas: {
            edgeTokenSchema,
        },
    },
} as const;

export type ValidatedEdgeTokensSchema = FromSchema<
    typeof validatedEdgeTokensSchema
>;
