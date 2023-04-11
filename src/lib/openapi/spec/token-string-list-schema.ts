import { edgeTokenSchema } from './edge-token-schema';
import { FromSchema } from 'json-schema-to-ts';

export const tokenStringListSchema = {
    $id: '#/components/schemas/tokenStringListSchema',
    type: 'object',
    additionalProperties: false,
    required: ['tokens'],
    properties: {
        tokens: {
            description: 'Tokens used to authenticate against Unleash',
            type: 'array',
            items: { type: 'string' },
        },
    },
    components: {
        schemas: {
            edgeTokenSchema,
        },
    },
} as const;

export type TokenStringListSchema = FromSchema<typeof tokenStringListSchema>;
