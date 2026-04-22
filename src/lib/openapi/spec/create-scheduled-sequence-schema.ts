import type { FromSchema } from 'json-schema-to-ts';

export const createScheduledSequenceSchema = {
    $id: '#/components/schemas/createScheduledSequenceSchema',
    additionalProperties: false,
    description:
        'Request body for creating a new scheduled sequence. The agent or API client supplies project, environment, optional provenance fields, and the list of actions.',
    type: 'object',
    required: ['project', 'environment', 'actions'],
    properties: {
        project: { type: 'string' },
        environment: { type: 'string' },
        prompt: { type: 'string', nullable: true },
        model: { type: 'string', nullable: true },
        agentVersion: { type: 'string', nullable: true },
        actions: {
            type: 'array',
            minItems: 1,
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

export type CreateScheduledSequenceSchema = FromSchema<
    typeof createScheduledSequenceSchema,
    { keepDefaultedPropertiesOptional: true }
>;
