import type { FromSchema } from 'json-schema-to-ts';
import { archivedFeatureSchema } from './archived-feature-schema';

export const archivedFeaturesSchema = {
    $id: '#/components/schemas/archivedFeaturesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'features'],
    description: 'A list of archived features',
    deprecated: true,
    properties: {
        version: {
            type: 'integer',
            description: "The version of the feature's schema",
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/archivedFeatureSchema',
            },
            description: 'A list of features',
        },
    },
    components: {
        schemas: {
            archivedFeatureSchema,
        },
    },
} as const;

export type ArchivedFeaturesSchema = FromSchema<typeof archivedFeaturesSchema>;
