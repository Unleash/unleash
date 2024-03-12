import type { FromSchema } from 'json-schema-to-ts';

export const applicationEnvironmentIssuesSchema = {
    $id: '#/components/schemas/applicationEnvironmentIssuesSchema',
    type: 'object',
    description: 'This list of issues that might be wrong with the application',
    additionalProperties: false,
    required: ['missingFeatures', 'outdatedSdks'],
    properties: {
        missingFeatures: {
            type: 'array',
            items: {
                type: 'string',
            },
            description: 'The list of features that are missing in Unleash',
            example: ['feature1', 'feature2'],
        },
        outdatedSdks: {
            type: 'array',
            items: {
                type: 'string',
            },
            description: 'The list of used SDKs that are outdated',
            example: ['unleash-client-node:5.4.0', 'unleash-client-node:5.3.0'],
        },
    },
    components: {},
} as const;

export type ApplicationEnvironmentIssuesSchema = FromSchema<
    typeof applicationEnvironmentIssuesSchema
>;
