import type { FromSchema } from 'json-schema-to-ts';

export const safeguardTriggerConditionSchema = {
    $id: '#/components/schemas/safeguardTriggerConditionSchema',
    type: 'object',
    required: ['operator', 'threshold'],
    additionalProperties: false,
    description: 'The condition that triggers the safeguard.',
    properties: {
        operator: {
            type: 'string',
            enum: ['>', '<'],
            description: 'The comparison operator for the threshold check.',
            example: '>',
        },
        threshold: {
            type: 'number',
            description: 'The threshold value to compare against.',
            example: 100,
        },
    },
    components: {},
} as const;

export type SafeguardTriggerConditionSchema = FromSchema<
    typeof safeguardTriggerConditionSchema
>;
