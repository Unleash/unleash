import { FromSchema } from 'json-schema-to-ts';

export const registerFeatureFeedbackSchema = {
    $id: '#/components/schemas/registerFeatureFeedbackSchema',
    type: 'object',
    required: ['payload'],
    description: 'Feedback passed from SDK to Unleash.',
    properties: {
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
    },
    components: {},
} as const;

export type RegisterFeatureFeedbackSchema = FromSchema<
    typeof registerFeatureFeedbackSchema
>;
