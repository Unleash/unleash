import type { FromSchema } from 'json-schema-to-ts';

export const featureLifecycleSchema = {
    $id: '#/components/schemas/featureLifecycleSchema',
    type: 'array',
    description: 'A list of lifecycle stages for a given feature',
    items: {
        additionalProperties: false,
        type: 'object',
        required: ['stage', 'enteredStageAt'],
        properties: {
            stage: {
                type: 'string',
                enum: ['initial', 'pre-live', 'live', 'completed', 'archived'],
                example: 'initial',
                description:
                    'The name of the lifecycle stage that got recorded for a given feature',
            },
            status: {
                type: 'string',
                example: 'kept',
                description:
                    'The name of the detailed status of a given stage. E.g. completed stage can be kept or discarded.',
            },
            enteredStageAt: {
                type: 'string',
                format: 'date-time',
                example: '2023-01-28T16:21:39.975Z',
                description: 'The date when the feature entered a given stage',
            },
        },
        description: 'The lifecycle stage of the feature',
    },
    components: {
        schemas: {},
    },
} as const;

export type FeatureLifecycleSchema = FromSchema<typeof featureLifecycleSchema>;
