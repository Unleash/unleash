import { FromSchema } from 'json-schema-to-ts';

export const permissionSchema = {
    $id: '#/components/schemas/permissionSchema',
    type: 'object',
    additionalProperties: false,
    required: ['permission'],
    properties: {
        permission: {
            type: 'string',
        },
        project: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type PermissionSchema = FromSchema<typeof permissionSchema>;
