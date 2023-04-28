import { FromSchema } from 'json-schema-to-ts';
import { createFeatureStrategySchema } from './create-feature-strategy-schema';

export const projectEnvironmentSchema = {
    $id: '#/components/schemas/projectEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['environment'],
    properties: {
        environment: {
            type: 'string',
        },
        changeRequestsEnabled: {
            type: 'boolean',
        },
        defaultStrategy: {
            $ref: '#/components/schemas/createFeatureStrategySchema',
        },
    },
    components: {
        schemas: {
            createFeatureStrategySchema,
        },
    },
} as const;

export type ProjectEnvironmentSchema = FromSchema<
    typeof projectEnvironmentSchema
>;
