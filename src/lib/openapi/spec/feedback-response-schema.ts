import { FromSchema } from 'json-schema-to-ts';
import { feedbackCreateSchema } from './feedback-create-schema';

export const feedbackResponseSchema = {
    ...feedbackCreateSchema,
    $id: '#/components/schemas/feedbackResponseSchema',
    additionalProperties: false,
    components: {},
} as const;

export type FeedbackResponseSchema = FromSchema<typeof feedbackResponseSchema>;
