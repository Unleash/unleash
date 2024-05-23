import type { FromSchema } from 'json-schema-to-ts';

export const frontendApiFeatureSchema = {
    $id: '#/components/schemas/frontendApiFeatureSchema',
    type: 'object',
    required: ['name', 'enabled', 'impressionData'],
    additionalProperties: false,
    description: 'Frontend API feature',
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
            description: 'Variant details',
            properties: {
                name: {
                    type: 'string',
                    description:
                        'The variants name. Is unique for this feature flag',
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
                    example: { type: 'json', value: '{"color": "red"}' },
                    properties: {
                        type: {
                            type: 'string',
                            description: 'The format of the payload.',
                            enum: ['json', 'csv', 'string', 'number'],
                        },
                        value: {
                            type: 'string',
                            description: 'The payload value stringified.',
                        },
                    },
                },
                feature_enabled: {
                    type: 'boolean',
                    description: 'Whether the feature is enabled or not.',
                    example: true,
                },
                featureEnabled: {
                    deprecated: true,
                    type: 'boolean',
                    description: 'Use `feature_enabled` instead.',
                    example: true,
                },
            },
        },
    },
    components: {},
} as const;

export type FrontendApiFeatureSchema = FromSchema<
    typeof frontendApiFeatureSchema
>;
