import type { FromSchema } from 'json-schema-to-ts';

export const setUserSettingSchema = {
    $id: '#/components/schemas/setUserSettingSchema',
    type: 'object',
    description: 'Schema for setting a user-specific value',
    required: ['key', 'value'],
    properties: {
        key: {
            type: 'string',
            description: 'Setting key',
            example: 'email',
        },
        value: {
            type: 'string',
            description: 'The setting value for the user',
            example: 'optOut',
        },
    },
    components: {},
} as const;

export type SetUserSettingSchema = FromSchema<typeof setUserSettingSchema>;
