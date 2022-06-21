import { FromSchema } from 'json-schema-to-ts';

export const updateApiTokenSchema = {
    $id: '#/components/schemas/updateApiTokenSchema',
    type: 'object',
    required: ['expiresAt'],
    properties: {
        expiresAt: {
            type: 'string',
            format: 'date-time',
        },
    },
    components: {},
} as const;

export type UpdateApiTokenSchema = FromSchema<typeof updateApiTokenSchema>;
