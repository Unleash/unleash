import type { FromSchema } from 'json-schema-to-ts';

export const compiledSequencePreviewSchema = {
    $id: '#/components/schemas/compiledSequencePreviewSchema',
    additionalProperties: false,
    description:
        'Preview of a Scheduled Sequence produced by the release agent. Not persisted until the client calls POST /sequences with the preview contents.',
    type: 'object',
    required: [
        'project',
        'environment',
        'prompt',
        'model',
        'agentVersion',
        'rationale',
        'actions',
    ],
    properties: {
        project: { type: 'string' },
        environment: { type: 'string' },
        prompt: { type: 'string' },
        model: { type: 'string' },
        agentVersion: { type: 'string' },
        rationale: {
            type: 'string',
            description:
                'Human-readable explanation of what the agent produced.',
        },
        actions: {
            type: 'array',
            items: {
                type: 'object',
                required: ['featureName', 'fireAt', 'actionType', 'payload'],
                additionalProperties: false,
                properties: {
                    featureName: { type: 'string' },
                    fireAt: { type: 'string', format: 'date-time' },
                    actionType: {
                        type: 'string',
                        enum: [
                            'strategy.create',
                            'strategy.update',
                            'strategy.delete',
                            'feature_environment.setEnabled',
                        ],
                    },
                    payload: {
                        type: 'object',
                        additionalProperties: true,
                    },
                    sortOrder: { type: 'integer' },
                },
            },
        },
    },
    components: { schemas: {} },
} as const;

export type CompiledSequencePreviewSchema = FromSchema<
    typeof compiledSequencePreviewSchema,
    { keepDefaultedPropertiesOptional: true }
>;
