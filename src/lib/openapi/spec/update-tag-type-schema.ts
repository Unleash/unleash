import { FromSchema } from 'json-schema-to-ts';

export const updateTagTypeSchema = {
    $id: '#/components/schemas/updateTagTypeSchema',
    type: 'object',
    properties: {
        description: {
            type: 'string',
        },
        icon: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type UpdateTagTypeSchema = FromSchema<typeof updateTagTypeSchema>;
