import { FromSchema } from 'json-schema-to-ts';

export const validatePasswordSchema = {
    $id: '#/components/schemas/validatePasswordSchema',
    type: 'object',
    additionalProperties: false,
    required: ['password'],
    description:
        'Used to validate passwords obeying [Unleash password guidelines](https://docs.getunleash.io/reference/deploy/securing-unleash#password-requirements)',
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
