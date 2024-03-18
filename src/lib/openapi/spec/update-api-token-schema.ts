import type { FromSchema } from 'json-schema-to-ts';

export const updateApiTokenSchema = {
    $id: '#/components/schemas/updateApiTokenSchema',
    type: 'object',
    required: ['expiresAt'],
    description: 'An object with fields to updated for a given API token.',
    properties: {
        expiresAt: {
            description: 'The new time when this token should expire.',
            example: '2023-09-04T11:26:24+02:00',
            type: 'string',
            format: 'date-time',
        },
    },
    components: {},
} as const;

export type UpdateApiTokenSchema = FromSchema<typeof updateApiTokenSchema>;
