import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const featureEnvironmentSchema = {
    $id: '#/components/schemas/featureEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'enabled'],
    properties: {
        name: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        strategies: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: [
                    'id',
                    'featureName',
                    'projectId',
                    'environment',
                    'strategyName',
                    'constraints',
                    'parameters',
                ],
                properties: {
                    id: {
                        type: 'string',
                    },
                    featureName: {
                        type: 'string',
                    },
                    projectId: {
                        type: 'string',
                    },
                    environment: {
                        type: 'string',
                    },
                    strategyName: {
                        type: 'string',
                    },
                    sortOrder: {
                        type: 'number',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                    },
                    constraints: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/constraintSchema',
                        },
                    },
                    parameters: {
                        $ref: '#/components/schemas/parametersSchema',
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
        },
    },
} as const;

export type FeatureEnvironmentSchema = FromSchema<
    typeof featureEnvironmentSchema
>;
