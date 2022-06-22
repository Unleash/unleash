import { FromSchema } from 'json-schema-to-ts';

export const emailSchema = {
    $id: '#/components/schemas/emailSchema',
    type: 'object',
    additionalProperties: false,
    required: ['email'],
    properties: {
        email: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type EmailSchema = FromSchema<typeof emailSchema>;
