import { FromSchema } from 'json-schema-to-ts';
import { groupUserModelSchema } from './group-user-model-schema';
import { userSchema } from './user-schema';

export const groupSchema = {
    $id: '#/components/schemas/groupSchema',
    type: 'object',
    additionalProperties: true,
    required: ['name'],
    properties: {
        id: {
            type: 'number',
        },
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
            nullable: true,
        },
        mappingsSSO: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        rootRole: {
            type: 'number',
            nullable: true,
            description:
                'A role id that is used as the root role for all users in this group. This can be either the id of the Editor or Admin role.',
        },
        createdBy: {
            type: 'string',
            nullable: true,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        users: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/groupUserModelSchema',
            },
        },
        projects: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {
        schemas: {
            groupUserModelSchema,
            userSchema,
        },
    },
} as const;

export type GroupSchema = FromSchema<typeof groupSchema>;
