import { FromSchema } from 'json-schema-to-ts';
import { versionSchema } from './version-schema';

export const uiConfigSchema = {
    $id: '#/components/schemas/uiConfigSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'version',
        'unleashUrl',
        'baseUriPath',
        'versionInfo',
        'disablePasswordAuth',
        'segmentValuesLimit',
        'strategySegmentsLimit',
    ],
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
        unleashUrl: {
            type: 'string',
        },
        baseUriPath: {
            type: 'string',
        },
        disablePasswordAuth: {
            type: 'boolean',
        },
        segmentValuesLimit: {
            type: 'number',
        },
        strategySegmentsLimit: {
            type: 'number',
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
