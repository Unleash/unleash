import type { FromSchema } from 'json-schema-to-ts';

export const scheduledActionSchema = {
    $id: '#/components/schemas/scheduledActionSchema',
    additionalProperties: false,
    description:
        'A single scheduled action belonging to a release-agent sequence. Fires at an absolute wall-clock time and invokes a strategy or feature-environment service call.',
    type: 'object',
    required: [
        'id',
        'sequenceId',
        'featureName',
        'fireAt',
        'actionType',
        'payload',
        'status',
        'sortOrder',
    ],
    properties: {
        id: {
            type: 'string',
            description: 'ULID identifying the action.',
            example: '01JB9GGTGQYEQ9D40R17T3YVWA',
        },
        sequenceId: {
            type: 'string',
            description: 'ULID of the parent sequence.',
            example: '01JB9GGTGQYEQ9D40R17T3YVW1',
        },
        featureName: {
            type: 'string',
            description: 'The feature this action targets.',
            example: 'my-feature',
        },
        fireAt: {
            type: 'string',
            format: 'date-time',
            description:
                'Absolute wall-clock time at which the action should fire.',
            example: '2026-04-22T09:00:00Z',
        },
        actionType: {
            type: 'string',
            enum: [
                'strategy.create',
                'strategy.update',
                'strategy.delete',
                'feature_environment.setEnabled',
                'mcp.invoke',
            ],
            description: 'What the action does when executed.',
        },
        payload: {
            type: 'object',
            description:
                'Action-type-specific payload. Shape depends on actionType.',
            additionalProperties: true,
        },
        ownedStrategyId: {
            type: 'string',
            nullable: true,
            description:
                'If this action created a strategy, the id of that strategy. Set by the executor.',
        },
        status: {
            type: 'string',
            enum: ['pending', 'executed', 'failed', 'skipped'],
            description: 'Execution status of this action.',
        },
        executedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'When the action was executed or finalised.',
        },
        error: {
            type: 'string',
            nullable: true,
            description: 'Error message if the action failed or was skipped.',
        },
        sortOrder: {
            type: 'integer',
            description: 'Order within the parent sequence.',
        },
    },
    components: { schemas: {} },
} as const;

export type ScheduledActionSchema = FromSchema<
    typeof scheduledActionSchema,
    { keepDefaultedPropertiesOptional: true }
>;
