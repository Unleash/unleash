import { FromSchema } from 'json-schema-to-ts';
import { edgeTokenSchema } from './edge-token-schema';

export const validateEdgeTokensSchema = {
    $id: '#/components/schemas/validateEdgeTokensSchema',
    type: 'object',
    additionalProperties: false,
    required: ['tokens'],
    properties: {
        tokens: {
            type: 'array',
            items: {
                anyOf: [
                    { $ref: '#/components/schemas/edgeTokenSchema' },
                    { type: 'string' },
                ],
            },
        },
    },
    components: {
        schemas: {
            edgeTokenSchema,
        },
    },
} as const;

export type ValidateEdgeTokensSchema = FromSchema<
    typeof validateEdgeTokensSchema
>;
