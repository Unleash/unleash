import { FromSchema } from 'json-schema-to-ts';

export const featureTagSchema = {
    $id: '#/components/schemas/featureTagSchema',
    type: 'object',
    description: 'Describes a tag applied to a feature',
    additionalProperties: false,
    required: ['featureName', 'tagValue'],
    properties: {
        featureName: {
            type: 'string',
            example: 'my-feature',
            description: 'The name of the feature this tag is applied to',
        },
        tagType: {
            type: 'string',
            example: 'simple',
            description: 'The type of tag',
        },
        tagValue: {
            type: 'string',
            example: 'my-tag',
            description: 'The value of the tag',
        },
        type: {
            deprecated: true,
            type: 'string',
            description:
                'This field is deprecated and currently unused, use tagType instead',
        },
        value: {
            deprecated: true,
            type: 'string',
            description:
                'This field is deprecated and currently unused, use tagValue instead',
        },
    },
    components: {},
} as const;

export type FeatureTagSchema = FromSchema<typeof featureTagSchema>;
