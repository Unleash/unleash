import { FromSchema } from 'json-schema-to-ts';
import { feedbackUpdateSchema } from './feedback-update-schema';

export const feedbackCreateSchema = {
    ...feedbackUpdateSchema,
    $id: '#/components/schemas/feedbackCreateSchema',
    required: ['feedbackId'],
    properties: {
        ...feedbackUpdateSchema.properties,
        feedbackId: {
            description: 'The name of the feedback session',
            type: 'string',
            example: 'pnps',
        },
    },
    components: {},
} as const;

export type FeedbackCreateSchema = FromSchema<typeof feedbackCreateSchema>;
