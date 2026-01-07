import type { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema.js';
import { roleSchema } from './role-schema.js';

const permission = {
    type: 'object',
    required: ['id', 'name', 'displayName', 'type'],
    additionalProperties: false,
    properties: {
        id: {
            type: 'integer',
            description: 'The ID of the permission',
            example: 1,
        },
        name: {
            type: 'string',
            description: 'The name of the permission',
            example: 'CREATE_FEATURE_STRATEGY',
        },
        displayName: {
            type: 'string',
            description: 'The display name of the permission',
            example: 'Create activation strategies',
        },
        type: {
            type: 'string',
            description: 'The type of the permission',
            example: 'environment',
        },
        environment: {
            type: 'string',
            nullable: true,
            description: 'The environment that the permission applies to',
            example: 'dev',
        },
    },
} as const;

const permissionWithHasPermission = {
    ...permission,
    required: [...permission.required, 'hasPermission'],
    properties: {
        ...permission.properties,
        hasPermission: {
            type: 'boolean',
            description: 'Whether the user has this permission',
            example: true,
        },
    },
} as const;

export const userAccessOverviewSchema = {
    $id: '#/components/schemas/userAccessOverviewSchema',
    type: 'object',
    required: ['overview', 'user', 'rootRole', 'projectRoles'],
    additionalProperties: false,
    description:
        'Describes the access overview (list of permissions and metadata) for a user.',
    properties: {
        overview: {
            type: 'object',
            required: ['root', 'project', 'environment'],
            additionalProperties: false,
            description:
                'The access overview (list of permissions) for the user',
            properties: {
                root: {
                    type: 'array',
                    description: 'The list of root permissions',
                    items: permissionWithHasPermission,
                },
                project: {
                    type: 'array',
                    description: 'The list of project permissions',
                    items: permissionWithHasPermission,
                },
                environment: {
                    type: 'array',
                    description: 'The list of environment permissions',
                    items: permissionWithHasPermission,
                },
            },
        },
        user: {
            description: 'The user that this access overview is for',
            $ref: userSchema.$id,
        },
        rootRole: {
            description: 'The name of the root role that this user has',
            $ref: roleSchema.$id,
        },
        projectRoles: {
            type: 'array',
            description:
                'The list of project roles that this user has in the selected project',
            items: {
                type: 'object',
                required: [...roleSchema.required, 'permissions'],
                additionalProperties: false,
                properties: {
                    ...roleSchema.properties,
                    permissions: {
                        type: 'array',
                        description: 'The permissions that this role has',
                        items: permission,
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            userSchema,
            roleSchema,
        },
    },
} as const;

export type UserAccessOverviewSchema = FromSchema<
    typeof userAccessOverviewSchema
>;
