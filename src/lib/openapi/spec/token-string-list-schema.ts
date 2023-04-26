import { FromSchema } from 'json-schema-to-ts';

export const tokenStringListSchema = {
    $id: '#/components/schemas/tokenStringListSchema',
    type: 'object',
    additionalProperties: true,
    description: 'A list of unleash tokens to validate against known tokens',
    required: ['tokens'],
    properties: {
        tokens: {
            description: 'Tokens that we want to get access information about',
            type: 'array',
            items: { type: 'string' },
            example: [
                'aproject:development.randomstring',
                '[]:production.randomstring',
            ],
        },
    },
    components: {},
} as const;

export type TokenStringListSchema = FromSchema<typeof tokenStringListSchema>;
