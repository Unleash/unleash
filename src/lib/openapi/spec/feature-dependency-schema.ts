import { FromSchema } from 'json-schema-to-ts';
import { createDependentFeatureSchema } from './create-dependent-feature-schema';
import { dependentFeatureSchema } from './dependent-feature-schema';

export const featureDependencySchema = {
    $id: '#/components/schemas/featureDependencySchema',
    type: 'object',
    description:
        'Feature dependency connection between a child feature and its parents',
    required: ['child', 'parents'],
    additionalProperties: false,
    properties: {
        child: {
            type: 'string',
            description: 'The name of the child feature.',
            example: 'child_feature',
        },
        parents: {
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

export type FeatureDependencySchema = FromSchema<
    typeof featureDependencySchema
>;
