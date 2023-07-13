import { FromSchema } from 'json-schema-to-ts';

export const feedbackUpdateSchema = {
    $id: '#/components/schemas/feedbackUpdateSchema',
    type: 'object',
    description: 'User feedback information',
    properties: {
        userId: {
            description: 'Identifier of the current user giving feedback',
            type: 'integer',
            example: 2,
        },
        neverShow: {
            description:
                '`true` when user opts-in to never show this feedback questionnaire again. Defaults to `false`.',
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
