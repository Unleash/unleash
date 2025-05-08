import type { FromSchema } from 'json-schema-to-ts';
import { environmentProjectSchema } from './environment-project-schema';
import { createFeatureStrategySchema } from './create-feature-strategy-schema';
import { createStrategyVariantSchema } from './create-strategy-variant-schema';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const environmentsProjectSchema = {
    $id: '#/components/schemas/environmentsProjectSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'environments'],
    description: 'Environments defined for a given project',
    properties: {
        version: {
            type: 'integer',
            example: 1,
            description: 'Version of the environments schema',
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/environmentProjectSchema',
            },
            description: 'List of environments',
        },
    },
    components: {
        schemas: {
            environmentProjectSchema,
            createFeatureStrategySchema,
            createStrategyVariantSchema,
            constraintSchema,
            parametersSchema,
        },
    },
} as const;

export type EnvironmentsProjectSchema = FromSchema<
    typeof environmentsProjectSchema
>;
