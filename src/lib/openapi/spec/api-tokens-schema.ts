import type { FromSchema } from 'json-schema-to-ts';
import { apiTokenSchema } from './api-token-schema.js';

export const apiTokensSchema = {
    $id: '#/components/schemas/apiTokensSchema',
    type: 'object',
    description:
        'An object with [Unleash API tokens](https://docs.getunleash.io/concepts/api-tokens-and-client-keys)',
    additionalProperties: false,
    required: ['tokens'],
    properties: {
        tokens: {
            type: 'array',
            description: 'A list of Unleash API tokens.',
            items: {
                $ref: '#/components/schemas/apiTokenSchema',
            },
        },
    },
    components: {
        schemas: {
            apiTokenSchema,
        },
    },
} as const;

export type ApiTokensSchema = FromSchema<typeof apiTokensSchema>;
