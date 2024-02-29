import { FromSchema } from 'json-schema-to-ts';

export const applicationOverviewIssuesSchema = {
    $id: '#/components/schemas/applicationOverviewIssuesSchema',
    type: 'object',
    description: 'This list of issues that might be wrong with the application',
    additionalProperties: false,
    required: ['type', 'items'],
    properties: {
        type: {
            type: 'string',
            enum: ['missingFeatures', 'missingStrategies', 'outdatedSdks'],
            description: 'The name of this action.',
        },
        items: {
            type: 'array',
            items: {
                type: 'string',
            },
            description:
                'The list of issues that might be wrong with the application',
            example: ['feature1', 'feature2'],
        },
    },
    components: {},
} as const;

export type ApplicationOverviewIssuesSchema = FromSchema<
    typeof applicationOverviewIssuesSchema
>;
