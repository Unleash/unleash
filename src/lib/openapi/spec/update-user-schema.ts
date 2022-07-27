import { FromSchema } from 'json-schema-to-ts';

export const updateUserSchema = {
    $id: '#/components/schemas/updateUserSchema',
    type: 'object',
    additionalProperties: true,
    properties: {
        email: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        rootRole: {
            type: 'number',
        },
    },
    components: {},
} as const;

export type UpdateUserSchema = FromSchema<typeof updateUserSchema>;
