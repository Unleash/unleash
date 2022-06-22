import { FromSchema } from 'json-schema-to-ts';

export const roleSchema = {
    $id: '#/components/schemas/roleSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'type', 'name'],
    properties: {
        id: {
            type: 'number',
        },
        type: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type RoleSchema = FromSchema<typeof roleSchema>;
