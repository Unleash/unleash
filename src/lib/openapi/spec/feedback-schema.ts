import { FromSchema } from 'json-schema-to-ts';

export const feedbackSchema = {
    $id: '#/components/schemas/feedbackSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        userId: {
            type: 'number',
        },
        feedbackId: {
            type: 'string',
        },
        neverShow: {
            type: 'boolean',
        },
        given: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
    },
    components: {},
} as const;

export type FeedbackSchema = FromSchema<typeof feedbackSchema>;
