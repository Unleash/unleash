import type { FromSchema } from 'json-schema-to-ts';

export const featureLifecycleCountSchema = {
    $id: '#/components/schemas/featureLifecycleCountSchema',
    type: 'object',
    description: 'A number features in each of the lifecycle stages',
    required: ['initial', 'preLive', 'live', 'completed', 'archived'],
    additionalProperties: false,
    properties: {
        initial: {
            type: 'number',
            example: 1,
            description: 'Number of features in the initial stage',
        },
        preLive: {
            type: 'number',
            example: 1,
            description: 'Number of features in the pre-live stage',
        },
        live: {
            type: 'number',
            example: 1,
            description: 'Number of features in the live stage',
        },
        completed: {
            type: 'number',
            example: 1,
            description: 'Number of features in the completed stage',
        },
        archived: {
            type: 'number',
            example: 1,
            description: 'Number of features in the archived stage',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type FeatureLifecycleCountSchema = FromSchema<
    typeof featureLifecycleCountSchema
>;
