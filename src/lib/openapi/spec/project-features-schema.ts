import type { FromSchema } from 'json-schema-to-ts';
import { tagSchema } from './tag-schema.js';
import { projectFeatureSchema } from './project-feature-schema.js';
import { projectFeatureEnvironmentSchema } from './project-feature-environment-schema.js';

export const projectFeaturesSchema = {
    $id: '#/components/schemas/projectFeaturesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'features'],
    description: 'A list of features in a project',
    deprecated: true,
    properties: {
        version: {
            type: 'integer',
            description: "The version of the feature's schema",
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectFeatureSchema',
            },
            description: 'A list of features',
        },
    },
    components: {
        schemas: {
            projectFeatureSchema,
            projectFeatureEnvironmentSchema,
            tagSchema,
        },
    },
} as const;

export type ProjectFeaturesSchema = FromSchema<typeof projectFeaturesSchema>;
