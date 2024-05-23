import type { FromSchema } from 'json-schema-to-ts';

export const validateFeatureSchema = {
    $id: '#/components/schemas/validateFeatureSchema',
    type: 'object',
    required: ['name'],
    description: "Data used to validate a feature flag's name.",
    properties: {
        name: {
            description: 'The feature name to validate.',
            type: 'string',
            example: 'my-feature-3',
        },
        projectId: {
            description:
                'The id of the project that the feature flag will belong to. If the target project has a feature naming pattern defined, the name will be validated against that pattern.',
            nullable: true,
            type: 'string',
            example: 'project-y',
        },
    },
    components: {},
} as const;

export type ValidateFeatureSchema = FromSchema<typeof validateFeatureSchema>;
