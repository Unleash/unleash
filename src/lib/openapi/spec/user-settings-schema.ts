import type { FromSchema } from 'json-schema-to-ts';
import { userSettingSchema } from './user-setting-schema.js';

export const userSettingsSchema = {
    $id: '#/components/schemas/userSettingsSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Settings of the current user, such as UI preferences.',
    required: ['settings'],
    properties: {
        settings: {
            type: 'object',
            description:
                'Settings by key. Keys are free-form and chosen by the client.',
            additionalProperties: {
                $ref: userSettingSchema.$id,
            },
            example: {
                'unleash-theme': { value: 'dark' },
                'feedback-module-survey-grace:v1': {
                    value: true,
                    expiresAt: '2026-12-01T12:00:00.000Z',
                },
            },
        },
    },
    components: {
        schemas: {
            userSettingSchema,
        },
    },
} as const;

export type UserSettingsSchema = FromSchema<typeof userSettingsSchema>;
