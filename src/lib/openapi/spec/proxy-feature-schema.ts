import { FromSchema } from 'json-schema-to-ts';
import { PayloadType } from 'unleash-client';

export const proxyFeatureSchema = {
    $id: '#/components/schemas/proxyFeatureSchema',
    type: 'object',
    required: ['name', 'enabled', 'impressionData'],
    additionalProperties: false,
    properties: {
        name: {
            type: 'string',
            example: 'disable-comments',
            description: 'Unique feature name.',
        },
        enabled: {
            type: 'boolean',
            example: true,
            description: 'Always set to `true`.',
        },
        impressionData: {
            type: 'boolean',
            example: false,
            description:
                '`true` if the impression data collection is enabled for the feature, otherwise `false`.',
        },
        variant: {
            type: 'object',
            required: ['name', 'enabled'],
            additionalProperties: false,
            properties: {
                name: {
                    type: 'string',
                    description:
                        'The variants name. Is unique for this feature toggle',
                    example: 'blue_group',
                },
                enabled: {
                    type: 'boolean',
                    example: true,
                    description: 'Whether the variant is enabled or not.',
                },
                payload: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['type', 'value'],
                    description: 'Extra data configured for this variant',
                    example: { type: 'json', value: '{color: red}' },
                    properties: {
                        type: {
                            type: 'string',
                            description: 'The format of the payload.',
                            enum: Object.values(PayloadType),
                        },
                        value: {
                            type: 'string',
                            description: 'The payload value stringified.',
                        },
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type ProxyFeatureSchema = FromSchema<typeof proxyFeatureSchema>;
