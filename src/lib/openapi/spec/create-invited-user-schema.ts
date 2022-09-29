import { FromSchema } from 'json-schema-to-ts';

export const createInvitedUserSchema = {
    $id: '#/components/schemas/createInvitedUserSchema',
    type: 'object',
    additionalProperties: false,
    required: ['email', 'name', 'password'],
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
    },
    components: {},
} as const;

export type CreateInvitedUserSchema = FromSchema<
    typeof createInvitedUserSchema
>;
