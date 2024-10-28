import type { FromSchema } from 'json-schema-to-ts';

export const userSettingsSchema = {
    $id: '#/components/schemas/userSettingsSchema',
    type: 'object',
    required: ['settings'],
    description: 'Schema representing user-specific settings in the system.',
    properties: {
        settings: {
            type: 'object',
            additionalProperties: {
                type: 'string',
                description: 'A user setting, represented as a key-value pair.',
                example: '{"dark_mode_enabled": "true"}',
            },
            description:
                'An object containing key-value pairs representing user settings.',
        },
    },
    components: {},
} as const;

export type UserSettingsSchema = FromSchema<typeof userSettingsSchema>;
