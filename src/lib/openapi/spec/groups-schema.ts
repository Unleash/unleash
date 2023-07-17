import { FromSchema } from 'json-schema-to-ts';
import { groupSchema } from './group-schema';
import { groupUserModelSchema } from './group-user-model-schema';
import { userSchema } from './user-schema';

export const groupsSchema = {
    $id: '#/components/schemas/groupsSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'A list of [user groups](https://docs.getunleash.io/reference/rbac#user-groups)',
    properties: {
        groups: {
            description: 'A list of groups',
            type: 'array',
            items: {
                $ref: '#/components/schemas/groupSchema',
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

export type GroupsSchema = FromSchema<typeof groupsSchema>;
