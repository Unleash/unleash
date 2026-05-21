import type { FromSchema } from 'json-schema-to-ts';

export const onboardingStatusSchema = {
    $id: '#/components/schemas/onboardingStatusSchema',
    type: 'object',
    description: 'The current onboarding status of a project.',
    example: { status: 'first-flag-created', feature: 'my-feature-flag' },
    oneOf: [
        {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['onboarding-started', 'sdk-connected', 'onboarded'],
                    example: 'onboarding-started',
                },
            },
            required: ['status'],
            additionalProperties: false,
        },
        {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['first-flag-created'],
                    example: 'first-flag-created',
                },
                feature: {
                    type: 'string',
                    description: 'The name of the feature flag',
                    example: 'my-feature-flag',
                },
            },
            required: ['status', 'feature'],
            additionalProperties: false,
        },
    ],
    components: {},
} as const;

export type OnboardingStatusSchema = FromSchema<typeof onboardingStatusSchema>;
