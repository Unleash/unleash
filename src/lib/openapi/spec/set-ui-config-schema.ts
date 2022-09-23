import { FromSchema } from 'json-schema-to-ts';

export const setUiConfigSchema = {
    $id: '#/components/schemas/setUiConfigSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        frontendSettings: {
            type: 'object',
            additionalProperties: false,
            required: ['frontendApiOrigins'],
            properties: {
                frontendApiOrigins: {
                    type: 'array',
                    items: { type: 'string' },
                },
            },
        },
    },
    components: {},
} as const;

export type SetUiConfigSchema = FromSchema<typeof setUiConfigSchema>;
