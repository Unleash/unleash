import type { FromSchema } from 'json-schema-to-ts';

export const emailSchema = {
    $id: '#/components/schemas/emailSchema',
    type: 'object',
    additionalProperties: false,
    required: ['email'],
    description:
        'Represents the email of a user. Used to send email communication (reset password, welcome mail etc)',
    properties: {
        email: {
            description: 'The email address',
            type: 'string',
            example: 'test@example.com',
        },
    },
    components: {},
} as const;

export type EmailSchema = FromSchema<typeof emailSchema>;
