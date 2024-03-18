import type { FromSchema } from 'json-schema-to-ts';

export const variantFlagSchema = {
    $id: '#/components/schemas/variantFlagSchema',
    type: 'object',
    additionalProperties: false,
    description: 'A representation of an evaluated Unleash feature variant.',
    properties: {
        name: {
            description:
                'The name of the variant. Will always be disabled if `enabled` is false.',
            example: 'blue',
            type: 'string',
        },
        enabled: {
            type: 'boolean',
            description: 'Whether the variant is enabled or not.',
            example: true,
        },
        payload: {
            type: 'object',
            description: 'Additional data associated with this variant.',
            additionalProperties: false,
            properties: {
                type: {
                    description: 'The type of data contained.',
                    type: 'string',
                    enum: ['string', 'json', 'csv', 'number'],
                    example: 'json',
                },
                value: {
                    description: 'The actual associated data',
                    type: 'string',
                    example: '{ "starter": "squirtle" }',
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
    components: {},
} as const;

export type VariantFlagSchema = FromSchema<typeof variantFlagSchema>;
