import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';

export const createUserResponseSchema = {
    $id: '#/components/schemas/createUserResponseSchema',
    type: 'object',
    additionalProperties: false,
    description: 'An Unleash user after creation',
    required: ['id'],
    properties: {
        ...userSchema.properties,
        rootRole: {
            description:
                'Which [root role](https://docs.getunleash.io/reference/rbac#predefined-roles) this user is assigned. Usually a numeric role ID, but can be a string when returning newly created user with an explicit string role.',
            oneOf: [
                {
                    type: 'integer',
                    example: 1,
                    minimum: 0,
                },
                {
                    type: 'string',
                    example: 'Admin',
                    enum: ['Admin', 'Editor', 'Viewer', 'Owner', 'Member'],
                },
            ],
        },
    },
    components: {},
} as const;

export type CreateUserResponseSchema = FromSchema<
    typeof createUserResponseSchema
>;
