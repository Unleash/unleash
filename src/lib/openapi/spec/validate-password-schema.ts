import type { FromSchema } from 'json-schema-to-ts';

export const validatePasswordSchema = {
    $id: '#/components/schemas/validatePasswordSchema',
    type: 'object',
    additionalProperties: false,
    required: ['password'],
    description:
        'Used to validate passwords obeying [Unleash password guidelines](https://docs.getunleash.io/using-unleash/deploy/configuring-unleash#securing-unleash)',
    properties: {
        password: {
            description: 'The password to validate',
            type: 'string',
            example: 'hunter2',
        },
    },
    components: {},
} as const;

export type ValidatePasswordSchema = FromSchema<typeof validatePasswordSchema>;
