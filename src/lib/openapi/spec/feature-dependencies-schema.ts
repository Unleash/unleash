import type { FromSchema } from 'json-schema-to-ts';
import { dependentFeatureSchema } from './dependent-feature-schema.js';

export const featureDependenciesSchema = {
    $id: '#/components/schemas/featureDependenciesSchema',
    type: 'object',
    description:
        'Feature dependency connection between a child feature and its dependencies',
    required: ['feature', 'dependencies'],
    additionalProperties: false,
    properties: {
        feature: {
            type: 'string',
            description: 'The name of the child feature.',
            example: 'child_feature',
        },
        dependencies: {
            type: 'array',
            description: 'List of parent features for the child feature',
            items: {
                $ref: '#/components/schemas/dependentFeatureSchema',
            },
        },
    },
    components: {
        schemas: {
            dependentFeatureSchema,
        },
    },
} as const;

export type FeatureDependenciesSchema = FromSchema<
    typeof featureDependenciesSchema
>;
