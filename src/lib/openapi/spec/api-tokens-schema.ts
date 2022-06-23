import { FromSchema } from 'json-schema-to-ts';
import { apiTokenSchema } from './api-token-schema';

export const apiTokensSchema = {
    $id: '#/components/schemas/apiTokensSchema',
    type: 'object',
    additionalProperties: false,
    required: ['tokens'],
    properties: {
        tokens: {
            type: 'array',
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
