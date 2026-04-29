import type { FromSchema } from 'json-schema-to-ts';

export const applicationOverviewIssuesSchema = {
    $id: '#/components/schemas/applicationOverviewIssuesSchema',
    type: 'object',
    description: 'This list of issues that might be wrong with the application',
    additionalProperties: false,
    required: ['missingStrategies'],
    properties: {
        missingStrategies: {
            type: 'array',
            items: {
                type: 'string',
            },
            description: 'The list of strategies that are missing from Unleash',
            example: ['feature1', 'feature2'],
        },
        deprecatedStrategies: {
            type: 'array',
            items: {
                type: 'string',
            },
            description:
                'The list of strategies that are deprecated in Unleash',
            example: ['feature3', 'featureX'],
        },
    },
    components: {},
} as const;

export type ApplicationOverviewIssuesSchema = FromSchema<
    typeof applicationOverviewIssuesSchema
>;
