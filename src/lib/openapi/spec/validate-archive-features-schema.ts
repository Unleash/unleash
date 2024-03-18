import type { FromSchema } from 'json-schema-to-ts';

export const validateArchiveFeaturesSchema = {
    $id: '#/components/schemas/validateArchiveFeaturesSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Validation details for features archive operation',
    required: ['parentsWithChildFeatures', 'hasDeletedDependencies'],
    properties: {
        parentsWithChildFeatures: {
            type: 'array',
            items: {
                type: 'string',
            },
            description:
                'List of parent features that would orphan child features that are not part of the archive operation',
            example: ['my-feature-4', 'my-feature-5', 'my-feature-6'],
        },
        hasDeletedDependencies: {
            type: 'boolean',
            description:
                'Whether any dependencies will be deleted as part of archive',
            example: true,
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type ValidateArchiveFeaturesSchema = FromSchema<
    typeof validateArchiveFeaturesSchema
>;
