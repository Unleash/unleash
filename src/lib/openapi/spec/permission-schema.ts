import type { FromSchema } from 'json-schema-to-ts';

export const permissionSchema = {
    $id: '#/components/schemas/permissionSchema',
    type: 'object',
    additionalProperties: false,
    required: ['permission'],
    description: 'Project and environment permissions',
    properties: {
        permission: {
            description:
                '[Project](https://docs.getunleash.io/concepts/rbac#project-level-permissions) or [environment](https://docs.getunleash.io/concepts/rbac#environment-level-permissions) permission name',
            type: 'string',
            example: 'UPDATE_FEATURE_STRATEGY',
        },
        project: {
            description: 'The project this permission applies to',
            type: 'string',
            example: 'my-project',
        },
        environment: {
            description: 'The environment this permission applies to',
            type: 'string',
            example: 'development',
        },
    },
    components: {},
} as const;

export type PermissionSchema = FromSchema<typeof permissionSchema>;
