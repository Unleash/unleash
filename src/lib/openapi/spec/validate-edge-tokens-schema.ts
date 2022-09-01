import { FromSchema } from 'json-schema-to-ts';
import { edgeTokensSchema } from './edge-token-schema';

export const validateEdgeTokensSchema = {
    $id: '#/components/schemas/validateEdgeTokensSchema',
    type: 'object',
    additionalProperties: false,
    required: ['tokens'],
    properties: {
        tokens: {
            type: 'array',
            anyOf: [
                { items: { $ref: '#/components/schemas/edgeTokensSchema' } },
                { items: { type: 'string' } },
            ],
        },
    },
    components: {
        schemas: {
            edgeTokensSchema,
        },
    },
} as const;

export type ValidateEdgeTokensSchema = FromSchema<
    typeof validateEdgeTokensSchema
>;
