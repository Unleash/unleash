import { FromSchema } from 'json-schema-to-ts';
import { featureFeedbackSchema } from './feature-feedback-schema';

export const getFeatureFeedbackSchema = {
    $id: '#/components/schemas/getFeatureFeedbackSchema',
    type: 'array',
    additionalProperties: false,
    description: 'Feedback passed from SDK to Unleash.',
    items: {
        $ref: '#/components/schemas/featureFeedbackSchema',
    },
    components: {
        schemas: {
            featureFeedbackSchema,
        },
    },
} as const;

export type GetFeatureFeedbackSchema = FromSchema<
    typeof getFeatureFeedbackSchema
>;
