import { FromSchema } from 'json-schema-to-ts';
import { versionSchema } from './version-schema';

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
        segmentValuesLimit: {
            type: 'number',
        },
        strategySegmentsLimit: {
            type: 'number',
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
                type: 'boolean',
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
        },
    },
} as const;

export type UiConfigSchema = FromSchema<typeof uiConfigSchema>;
