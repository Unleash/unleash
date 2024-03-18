import type { FromSchema } from 'json-schema-to-ts';

export const feedbackResponseSchema = {
    $id: '#/components/schemas/feedbackResponseSchema',
    additionalProperties: false,
    type: 'object',
    description: 'User feedback information about a particular feedback item.',
    properties: {
        userId: {
            description: 'The ID of the user that gave the feedback.',
            type: 'integer',
            example: 2,
        },
        neverShow: {
            description:
                '`true` if the user has asked never to see this feedback questionnaire again.',
            type: 'boolean',
            example: false,
        },
        given: {
            description: 'When this feedback was given',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-07-06T08:29:21.282Z',
        },
        feedbackId: {
            description: 'The name of the feedback session',
            type: 'string',
            example: 'pnps',
        },
    },
    components: {},
} as const;

export type FeedbackResponseSchema = FromSchema<typeof feedbackResponseSchema>;
