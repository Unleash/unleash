import type { FromSchema } from 'json-schema-to-ts';

export const createDependentFeatureSchema = {
    $id: '#/components/schemas/createDependentFeatureSchema',
    type: 'object',
    description: 'Feature dependency on a parent feature in write model',
    required: ['feature'],
    properties: {
        feature: {
            type: 'string',
            description: 'The name of the feature we depend on.',
            example: 'parent_feature',
        },
        enabled: {
            type: 'boolean',
            description:
                'Whether the parent feature should be enabled. When `false` variants are ignored. `true` by default.',
            example: false,
        },
        variants: {
            type: 'array',
            description:
                'The list of variants the parent feature should resolve to. Leave empty when you only want to check the `enabled` status.',
            items: {
                type: 'string',
            },
            example: ['variantA', 'variantB'],
        },
    },
    components: {},
} as const;

export type CreateDependentFeatureSchema = FromSchema<
    typeof createDependentFeatureSchema
>;
