import type { FromSchema } from 'json-schema-to-ts';
import { scheduledSequenceSchema } from './scheduled-sequence-schema.js';
import { scheduledActionSchema } from './scheduled-action-schema.js';

export const scheduledSequencesSchema = {
    $id: '#/components/schemas/scheduledSequencesSchema',
    additionalProperties: false,
    description: 'A list of scheduled sequences for a project and environment.',
    type: 'object',
    required: ['sequences'],
    properties: {
        sequences: {
            type: 'array',
            items: { $ref: '#/components/schemas/scheduledSequenceSchema' },
        },
    },
    components: {
        schemas: {
            scheduledSequenceSchema,
            scheduledActionSchema,
        },
    },
} as const;

export type ScheduledSequencesSchema = FromSchema<
    typeof scheduledSequencesSchema,
    { keepDefaultedPropertiesOptional: true }
>;
