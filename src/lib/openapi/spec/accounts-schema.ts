import { FromSchema } from 'json-schema-to-ts';
import { accountSchema } from './account-schema';
import { roleSchema } from './role-schema';

export const accountsSchema = {
    $id: '#/components/schemas/accountsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['accounts'],
    properties: {
        accounts: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/accountSchema',
            },
        },
        rootRoles: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/roleSchema',
            },
        },
    },
    components: {
        schemas: {
            accountSchema,
            roleSchema,
        },
    },
} as const;

export type AccountsSchema = FromSchema<typeof accountsSchema>;
