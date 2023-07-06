import { FromSchema } from 'json-schema-to-ts';

export const feedbackSchema = {
    $id: '#/components/schemas/feedbackSchema',
    type: 'object',
    additionalProperties: false,
    description: 'User feedback information',
    properties: {
        userId: {
            description: 'Identifier of the current user giving feedback',
            type: 'number',
            example: 2,
        },
        feedbackId: {
            description: 'The name of the feedback session',
            type: 'string',
            example: 'pnps',
        },
        neverShow: {
            description: 'Whether this feedback should be disabled',
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

export type FeedbackSchema = FromSchema<typeof feedbackSchema>;
