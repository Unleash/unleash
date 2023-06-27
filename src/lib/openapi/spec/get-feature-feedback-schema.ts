import { FromSchema } from 'json-schema-to-ts';

export const getFeatureFeedbackSchema = {
    $id: '#/components/schemas/getFeatureFeedbackSchema',
    type: 'object',
    required: ['payload'],
    description: 'Feedback passed from SDK to Unleash.',
    properties: {
        id: {
            type: 'number',
            example: 1,
            description: 'Unique id for this feedback.',
        },
        createdAt: {
            type: 'string',
            example: '2023-06-27T07:33:07.165Z',
            description: 'Timestamp for when this feedback was created.',
        },
        payload: {
            type: 'string',
            example: '1',
            description: 'Number representing user feedback rating. 1-5.',
        },
        featureName: {
            type: 'string',
            example: 'toggle1',
            description:
                'The name of the feature toggle this feedback applies to.',
        },
        contextHash: {
            type: 'string',
            example: 'xyz123',
            nullable: true,
            description:
                'A hash of the context that this feedback was provided for.',
        },
        metadata: {
            type: 'object',
            example: {},
            description: 'Metadata saved alongside the feedback.',
        },
    },
    components: {},
} as const;

export type GetFeatureFeedbackSchema = FromSchema<
    typeof getFeatureFeedbackSchema
>;
