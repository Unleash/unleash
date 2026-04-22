import type { FromSchema } from 'json-schema-to-ts';
import { scheduledActionSchema } from './scheduled-action-schema.js';

export const scheduledSequenceSchema = {
    $id: '#/components/schemas/scheduledSequenceSchema',
    additionalProperties: false,
    description:
        'A scheduled sequence authored by the release agent: a set of timed actions that mutate strategies and feature-environment state for one or more features in a project/environment.',
    type: 'object',
    required: ['id', 'project', 'environment', 'createdAt', 'status'],
    properties: {
        id: {
            type: 'string',
            description: 'ULID identifying the sequence.',
            example: '01JB9GGTGQYEQ9D40R17T3YVW1',
        },
        project: { type: 'string', example: 'default' },
        environment: { type: 'string', example: 'production' },
        createdByUserId: {
            type: 'integer',
            nullable: true,
            description: 'The user who authored the sequence.',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
        prompt: {
            type: 'string',
            nullable: true,
            description:
                'The natural-language intent the sequence was compiled from.',
        },
        model: {
            type: 'string',
            nullable: true,
            description: 'The LLM model used to author the sequence, if any.',
        },
        agentVersion: {
            type: 'string',
            nullable: true,
            description:
                'The release-agent version used to author the sequence.',
        },
        status: {
            type: 'string',
            enum: ['active', 'cancelled', 'completed', 'conflicted'],
        },
        actions: {
            type: 'array',
            items: { $ref: '#/components/schemas/scheduledActionSchema' },
            description:
                'Actions belonging to the sequence. Present on detail responses.',
        },
    },
    components: {
        schemas: {
            scheduledActionSchema,
        },
    },
} as const;

export type ScheduledSequenceSchema = FromSchema<
    typeof scheduledSequenceSchema,
    { keepDefaultedPropertiesOptional: true }
>;
