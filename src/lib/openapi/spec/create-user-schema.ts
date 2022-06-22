import { FromSchema } from 'json-schema-to-ts';

export const createUserSchema = {
    $id: '#/components/schemas/createUserSchema',
    type: 'object',
    additionalProperties: false,
    required: ['rootRole'],
    properties: {
        username: {
            type: 'string',
        },
        email: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        password: {
            type: 'string',
        },
        rootRole: {
            type: 'number',
        },
        sendEmail: {
            type: 'boolean',
        },
    },
    components: {},
} as const;

export type CreateUserSchema = FromSchema<typeof createUserSchema>;
