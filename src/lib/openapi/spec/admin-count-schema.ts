import { FromSchema } from 'json-schema-to-ts';

export const adminCountSchema = {
    $id: '#/components/schemas/adminCountSchema',
    type: 'object',
    additionalProperties: false,
    required: ['password', 'no_password', 'service'],
    properties: {
        password: {
            type: 'number',
        },
        no_password: {
            type: 'number',
        },
        service: {
            type: 'number',
        },
    },
    components: {},
} as const;

export type AdminCountSchema = FromSchema<typeof adminCountSchema>;
