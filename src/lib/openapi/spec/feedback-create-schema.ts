import type { FromSchema } from 'json-schema-to-ts';

export const feedbackCreateSchema = {
    $id: '#/components/schemas/feedbackCreateSchema',
    required: ['feedbackId'],
    type: 'object',
    description: 'User feedback information to be created.',
    properties: {
        neverShow: {
            description:
                '`true` if the user has asked never to see this feedback questionnaire again. Defaults to `false`.',
            type: 'boolean',
            example: false,
        },
        feedbackId: {
            description: 'The name of the feedback session',
            type: 'string',
            example: 'pnps',
        },
    },
    components: {},
} as const;

export type FeedbackCreateSchema = FromSchema<typeof feedbackCreateSchema>;
