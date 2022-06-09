import { FromSchema } from 'json-schema-to-ts';

export const updateUserSchema = {
    $id: '#/components/schemas/updateUserSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        id: {
            type: 'string',
        },
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

export type UpdateUserSchema = FromSchema<typeof updateUserSchema>;
