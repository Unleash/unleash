import { roleSchema } from './role-schema.js';
import type { FromSchema } from 'json-schema-to-ts';

export const rolesSchema = {
    $id: '#/components/schemas/rolesSchema',
    type: 'object',
    description: 'A list of roles',
    additionalProperties: false,
    required: ['version', 'roles'],
    properties: {
        version: {
            type: 'integer',
            description: 'The version of the role schema used',
            minimum: 1,
            example: 1,
        },
        roles: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/roleSchema',
            },
            description: 'A list of roles',
        },
    },
    components: {
        schemas: {
            roleSchema,
        },
    },
} as const;

export type RolesSchema = FromSchema<typeof rolesSchema>;
