import { FromSchema } from 'json-schema-to-ts';

export const proxyFeatureSchema = {
    $id: '#/components/schemas/proxyFeatureSchema',
    type: 'object',
    required: ['name', 'enabled', 'impressionData'],
    additionalProperties: false,
    properties: {
        name: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        impressionData: {
            type: 'boolean',
        },
        variant: {
            type: 'object',
            required: ['name', 'enabled'],
            additionalProperties: false,
            properties: {
                name: {
                    type: 'string',
                },
                enabled: {
                    type: 'boolean',
                },
                payload: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['type', 'value'],
                    properties: {
                        type: { type: 'string', enum: ['string'] },
                        value: { type: 'string' },
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type ProxyFeatureSchema = FromSchema<typeof proxyFeatureSchema>;
