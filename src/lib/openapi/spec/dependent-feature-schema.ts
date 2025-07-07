import type { FromSchema } from 'json-schema-to-ts';
import { createDependentFeatureSchema } from './create-dependent-feature-schema.js';

export const dependentFeatureSchema = {
    $id: '#/components/schemas/dependentFeatureSchema',
    type: 'object',
    description: 'Feature dependency on a parent feature in read model',
    required: ['feature'],
    additionalProperties: false,
    properties: createDependentFeatureSchema.properties,
    components: {},
} as const;

export type DependentFeatureSchema = FromSchema<typeof dependentFeatureSchema>;
