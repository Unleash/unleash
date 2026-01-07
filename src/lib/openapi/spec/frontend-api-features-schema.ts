import type { FromSchema } from 'json-schema-to-ts';
import { frontendApiFeatureSchema } from './frontend-api-feature-schema.js';

export const frontendApiFeaturesSchema = {
    $id: '#/components/schemas/frontendApiFeaturesSchema',
    type: 'object',
    required: ['toggles'],
    additionalProperties: false,
    description: 'Frontend SDK features list',
    properties: {
        toggles: {
            description: 'The actual features returned to the Frontend SDK',
            type: 'array',
            items: {
                $ref: frontendApiFeatureSchema.$id,
            },
        },
    },
    components: {
        schemas: {
            frontendApiFeatureSchema,
        },
    },
} as const;

export type FrontendApiFeaturesSchema = FromSchema<
    typeof frontendApiFeaturesSchema
>;
