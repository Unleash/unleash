import { FromSchema } from 'json-schema-to-ts';
import { groupSchema } from './group-schema';
import { userSchema } from './user-schema';
import { groupUserModelSchema } from './group-user-model-schema';

export const usersGroupsBaseSchema = {
    $id: '#/components/schemas/usersGroupsBaseSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        groups: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/groupSchema',
            },
        },
        users: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/userSchema',
            },
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
