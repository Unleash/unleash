import type { FromSchema } from 'json-schema-to-ts';

export const idSchema = {
    $id: '#/components/schemas/idSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Email id used for password reset',
    required: ['id'],
    properties: {
        id: {
            type: 'string',
            description: 'User email',
            example: 'user@example.com',
        },
    },
    components: {},
} as const;

export type IdSchema = FromSchema<typeof idSchema>;
