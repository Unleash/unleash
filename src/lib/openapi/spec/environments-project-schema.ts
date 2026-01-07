import type { FromSchema } from 'json-schema-to-ts';
import { environmentProjectSchema } from './environment-project-schema.js';
import { constraintSchema } from './constraint-schema.js';
import { parametersSchema } from './parameters-schema.js';
import { featureStrategySchema } from './feature-strategy-schema.js';
import { strategyVariantSchema } from './strategy-variant-schema.js';

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
            featureStrategySchema,
            strategyVariantSchema,
            constraintSchema,
            parametersSchema,
        },
    },
} as const;

export type EnvironmentsProjectSchema = FromSchema<
    typeof environmentsProjectSchema,
    { keepDefaultedPropertiesOptional: true }
>;
