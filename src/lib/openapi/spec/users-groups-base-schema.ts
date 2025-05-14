import type { FromSchema } from 'json-schema-to-ts';
import { groupSchema } from './group-schema.js';
import { userSchema } from './user-schema.js';
import { groupUserModelSchema } from './group-user-model-schema.js';

export const usersGroupsBaseSchema = {
    $id: '#/components/schemas/usersGroupsBaseSchema',
    type: 'object',
    additionalProperties: false,
    description: 'An overview of user groups and users.',
    properties: {
        groups: {
            type: 'array',
            description: 'A list of user groups and their configuration.',
            items: {
                $ref: '#/components/schemas/groupSchema',
            },
            example: [
                {
                    id: 1,
                    name: 'unleash-e2e-7095756699593281',
                    userCount: 1,
                    rootRole: null,
                },
            ],
        },
        users: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/userSchema',
            },
            description: 'A list of users.',
            example: [
                {
                    id: 4,
                    name: 'unleash-e2e-user2-7095756699593281',
                    email: 'unleash-e2e-user2-7095756699593281@test.com',
                    accountType: 'User',
                },
                {
                    id: 1,
                    username: 'admin',
                    accountType: 'User',
                },
            ],
        },
    },
    components: {
        schemas: {
            groupSchema,
            groupUserModelSchema,
            userSchema,
        },
    },
} as const;

export type UsersGroupsBaseSchema = FromSchema<typeof usersGroupsBaseSchema>;
