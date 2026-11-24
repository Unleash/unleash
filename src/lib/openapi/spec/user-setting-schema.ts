import type { FromSchema } from 'json-schema-to-ts';

export const userSettingSchema = {
    $id: '#/components/schemas/userSettingSchema',
    type: 'object',
    additionalProperties: false,
    description: 'One setting of the current user.',
    required: ['value'],
    properties: {
        value: {
            description: 'Any JSON value. `null` marks the setting as removed.',
            example: 'dark',
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
            description:
                'When the setting expires. Left out when it never expires.',
            example: '2026-12-01T12:00:00.000Z',
        },
    },
    components: {},
} as const;

export type UserSettingSchema = FromSchema<typeof userSettingSchema>;
