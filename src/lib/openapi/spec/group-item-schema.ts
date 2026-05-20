import type { FromSchema } from 'json-schema-to-ts';

export const groupItemSchema = {
    $id: '#/components/schemas/groupItemSchema',
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
        scimId: {
            description:
                'The SCIM ID of the group, only present if managed by SCIM',
            type: 'string',
            nullable: true,
            example: '01HTMEXAMPLESCIMID7SWWGHN7',
        },
    },
    components: {},
} as const;

export type GroupItemSchema = FromSchema<typeof groupItemSchema>;
