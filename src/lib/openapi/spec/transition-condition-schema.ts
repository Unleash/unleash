import type { FromSchema } from 'json-schema-to-ts';

export const transitionConditionSchema = {
    $id: '#/components/schemas/transitionConditionSchema',
    type: 'object',
    additionalProperties: false,
    required: ['intervalMinutes'],
    description: 'A transition condition for milestone progression',
    properties: {
        intervalMinutes: {
            type: 'integer',
            minimum: 1,
            description: 'The interval in minutes before transitioning',
            example: 30,
        },
    },
    components: {},
} as const;

export type TransitionConditionSchema = FromSchema<
    typeof transitionConditionSchema
>;
