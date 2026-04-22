import type { FromSchema } from 'json-schema-to-ts';
import { releaseAgentSafeguardSchema } from './release-agent-safeguard-schema.js';

export const compiledSequencePreviewSchema = {
    $id: '#/components/schemas/compiledSequencePreviewSchema',
    additionalProperties: false,
    description:
        'Preview of a Scheduled Sequence produced by the release agent. Not persisted until the client calls POST /sequences with the preview contents. If the agent needs clarification, actions and safeguards are empty and `clarification` is set instead.',
    type: 'object',
    required: [
        'project',
        'environment',
        'prompt',
        'model',
        'agentVersion',
        'rationale',
        'actions',
        'safeguards',
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
        safeguards: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/releaseAgentSafeguardSchema',
            },
        },
        clarification: {
            type: 'string',
            description:
                'Set when the agent needs more information from the user. When present, `actions` and `safeguards` are empty.',
        },
    },
    components: { schemas: { releaseAgentSafeguardSchema } },
} as const;

export type CompiledSequencePreviewSchema = FromSchema<
    typeof compiledSequencePreviewSchema,
    { keepDefaultedPropertiesOptional: true }
>;
