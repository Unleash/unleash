import type { FromSchema } from 'json-schema-to-ts';

export const createInvitedUserSchema = {
    $id: '#/components/schemas/createInvitedUserSchema',
    type: 'object',
    additionalProperties: false,
    required: ['email', 'name', 'password'],
    description: 'Data used to create a user that has been invited to Unleash.',
    properties: {
        username: {
            type: 'string',
            description: "The user's username. Must be unique if provided.",
            example: 'Hunter',
        },
        email: {
            type: 'string',
            description: "The invited user's email address",
            example: 'hunter@example.com',
        },
        name: {
            type: 'string',
            description: "The user's name",
            example: 'Hunter Burgan',
        },
        password: {
            type: 'string',
            description: "The user's password",
            example: 'hunter2',
        },
    },
    components: {},
} as const;

export type CreateInvitedUserSchema = FromSchema<
    typeof createInvitedUserSchema
>;
