import { FromSchema } from 'json-schema-to-ts';

export const validatePasswordSchema = {
    $id: '#/components/schemas/validatePasswordSchema',
    type: 'object',
    additionalProperties: false,
    required: ['password'],
    properties: {
        password: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type ValidatePasswordSchema = FromSchema<typeof validatePasswordSchema>;
