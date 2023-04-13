import { FromSchema } from 'json-schema-to-ts';
import { edgeTokenSchema } from './edge-token-schema';

export const validatedEdgeTokensSchema = {
    $id: '#/components/schemas/validatedEdgeTokensSchema',
    type: 'object',
    additionalProperties: false,
    required: ['tokens'],
    description: `A list of Unleash client tokens with what projects they can access included`,
    properties: {
        tokens: {
            description:
                'Includes which projects the client tokens can access as well as the token itself',
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
