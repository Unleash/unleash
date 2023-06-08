import { FromSchema } from 'json-schema-to-ts';

export const contextFieldStrategiesSchema = {
    $id: '#/components/schemas/segmentStrategiesSchema',
    type: 'object',
    required: ['strategies'],
    properties: {
        strategies: {
            type: 'array',
            items: {
                type: 'object',
                required: [
                    'id',
                    'featureName',
                    'projectId',
                    'environment',
                    'strategyName',
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
                },
            },
        },
    },
    components: {},
} as const;

export type ContextFieldStrategiesSchema = FromSchema<
    typeof contextFieldStrategiesSchema
>;
