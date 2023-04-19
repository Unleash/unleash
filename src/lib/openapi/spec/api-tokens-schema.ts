import { FromSchema } from 'json-schema-to-ts';
import { apiTokenSchema } from './api-token-schema';

export const apiTokensSchema = {
    $id: '#/components/schemas/apiTokensSchema',
    type: 'object',
    additionalProperties: false,
    required: ['tokens'],
    description: 'Contains a list of API tokens.',
    properties: {
        tokens: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/apiTokenSchema',
            },
            description: 'A list of API tokens.',
        },
    },
    components: {
        schemas: {
            apiTokenSchema,
        },
    },
} as const;

export type ApiTokensSchema = FromSchema<typeof apiTokensSchema>;
