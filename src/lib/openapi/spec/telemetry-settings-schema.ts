import { FromSchema } from 'json-schema-to-ts';

export const telemetrySettingsSchema = {
    $id: '#/components/schemas/telemetrySettingsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['versionInfoCollectionEnabled', 'featureInfoCollectionEnabled'],
    description:
        'Contains information about which settings are configured for version info collection and feature usage collection.',
    properties: {
        versionInfoCollectionEnabled: {
            type: 'boolean',
            description:
                'Whether collection of version info is enabled/active.',
            example: true,
        },
        featureInfoCollectionEnabled: {
            type: 'boolean',
            description:
                'Whether collection of feature usage metrics is enabled/active.',
            example: true,
        },
    },
    components: {},
} as const;

export type TelemetrySettingsSchema = FromSchema<
    typeof telemetrySettingsSchema
>;
