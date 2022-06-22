import { FromSchema } from 'json-schema-to-ts';

export const featureTagSchema = {
    $id: '#/components/schemas/featureTagSchema',
    type: 'object',
    additionalProperties: false,
    required: ['featureName', 'tagValue'],
    properties: {
        featureName: {
            type: 'string',
        },
        tagType: {
            type: 'string',
        },
        tagValue: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        value: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type FeatureTagSchema = FromSchema<typeof featureTagSchema>;
