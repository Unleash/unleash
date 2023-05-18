import { FromSchema } from 'json-schema-to-ts';
import { versionSchema } from './version-schema';
import { variantFlagSchema } from './variant-flag-schema';

export const uiConfigSchema = {
    $id: '#/components/schemas/uiConfigSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'unleashUrl', 'baseUriPath', 'versionInfo'],
    properties: {
        slogan: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        version: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        unleashUrl: {
            type: 'string',
        },
        baseUriPath: {
            type: 'string',
        },
        disablePasswordAuth: {
            type: 'boolean',
        },
        emailEnabled: {
            type: 'boolean',
        },
        maintenanceMode: {
            type: 'boolean',
        },
        segmentValuesLimit: {
            type: 'number',
        },
        strategySegmentsLimit: {
            type: 'number',
        },
        networkViewEnabled: {
            type: 'boolean',
        },
        frontendApiOrigins: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        flags: {
            type: 'object',
            additionalProperties: {
                anyOf: [
                    {
                        type: 'boolean',
                    },
                    {
                        $ref: '#/components/schemas/variantFlagSchema',
                    },
                ],
            },
        },
        links: {
            type: 'array',
            items: {
                type: 'object',
            },
        },
        authenticationType: {
            type: 'string',
            enum: [
                'open-source',
                'demo',
                'enterprise',
                'hosted',
                'custom',
                'none',
            ],
        },
        versionInfo: {
            $ref: '#/components/schemas/versionSchema',
        },
    },
    components: {
        schemas: {
            versionSchema,
            variantFlagSchema,
        },
    },
} as const;

export type UiConfigSchema = FromSchema<typeof uiConfigSchema>;
