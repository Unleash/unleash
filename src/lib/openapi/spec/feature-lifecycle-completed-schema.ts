import type { FromSchema } from 'json-schema-to-ts';

export const featureLifecycleCompletedSchema = {
    $id: '#/components/schemas/featureLifecycleCompletedSchema',
    description: 'A feature that has been marked as completed',
    additionalProperties: false,
    type: 'object',
    required: ['status'],
    properties: {
        status: {
            type: 'string',
            enum: ['kept', 'discarded'],
            example: 'kept',
            description:
                'The status of the feature after it has been marked as completed',
        },
        statusValue: {
            type: 'string',
            example: 'variant1',
            description: 'The metadata value passed in together with status',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type FeatureLifecycleCompletedSchema = FromSchema<
    typeof featureLifecycleCompletedSchema
>;
