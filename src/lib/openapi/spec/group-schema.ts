import type { FromSchema } from 'json-schema-to-ts';
import { groupUserModelSchema } from './group-user-model-schema.js';
import { userSchema } from './user-schema.js';

export const groupSchema = {
    $id: '#/components/schemas/groupSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    description: 'A detailed information about a user group',
    properties: {
        id: {
            description: 'The group id',
            type: 'integer',
            example: 1,
        },
        name: {
            description: 'The name of the group',
            type: 'string',
            example: 'DX team',
        },
        description: {
            description: 'A custom description of the group',
            type: 'string',
            nullable: true,
            example: 'Current members of the DX squad',
        },
        mappingsSSO: {
            description:
                'A list of SSO groups that should map to this Unleash group',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['SSOGroup1', 'SSOGroup2'],
        },
        rootRole: {
            type: 'number',
            nullable: true,
            description:
                'A role id that is used as the root role for all users in this group. This can be either the id of the Viewer, Editor or Admin role.',
            example: 1,
        },
        createdBy: {
            description: 'A user who created this group',
            type: 'string',
            nullable: true,
            example: 'admin',
        },
        createdAt: {
            description: 'When was this group created',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-06-30T11:41:00.123Z',
        },
        users: {
            type: 'array',
            description: 'A list of users belonging to this group',
            items: {
                $ref: '#/components/schemas/groupUserModelSchema',
            },
        },
        projects: {
            description: 'A list of projects where this group is used',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['default', 'my-project'],
        },
        userCount: {
            description: 'The number of users that belong to this group',
            example: 1,
            type: 'integer',
            minimum: 0,
        },
        scimId: {
            description:
                'The SCIM ID of the group, only present if managed by SCIM',
            type: 'string',
            nullable: true,
            example: '01HTMEXAMPLESCIMID7SWWGHN7',
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
