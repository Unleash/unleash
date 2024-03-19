import type { FromSchema } from 'json-schema-to-ts';

export const feedbackUpdateSchema = {
    $id: '#/components/schemas/feedbackUpdateSchema',
    type: 'object',
    description: 'User feedback information to be updated.',
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
    },
    components: {},
} as const;

export type FeedbackUpdateSchema = FromSchema<typeof feedbackUpdateSchema>;
