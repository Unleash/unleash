import type { FromSchema } from 'json-schema-to-ts';
import { createFeatureStrategySchema } from './create-feature-strategy-schema.js';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';

export const projectEnvironmentSchema = {
    $id: '#/components/schemas/projectEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'Add an environment to a project, optionally also sets if change requests are enabled for this environment on the project',
    required: ['environment'],
    properties: {
        environment: {
            type: 'string',
            description: 'The environment to add to the project',
            example: 'development',
        },
        changeRequestsEnabled: {
            type: 'boolean',
            description:
                'Whether change requests should be enabled or for this environment on the project or not',
            example: true,
        },
        defaultStrategy: {
            $ref: '#/components/schemas/createFeatureStrategySchema',
            description:
                'A default strategy to create for this environment on the project.',
        },
    },
    components: {
        schemas: {
            createFeatureStrategySchema,
            createStrategyVariantSchema,
        },
    },
} as const;

export type ProjectEnvironmentSchema = FromSchema<
    typeof projectEnvironmentSchema
>;
