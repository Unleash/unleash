import { FromSchema } from 'json-schema-to-ts';

export const validateFeatureSchema = {
    $id: '#/components/schemas/validateFeatureSchema',
    type: 'object',
    required: ['name'],
    description: "Data used to validate a feature toggle's name.",
    properties: {
        name: {
            description: 'The feature name to validate.',
            type: 'string',
            example: 'my-feature-3',
        },
    },
    components: {},
} as const;

export type ValidateFeatureSchema = FromSchema<typeof validateFeatureSchema>;
