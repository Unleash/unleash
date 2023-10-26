import { FromQueryParams, OpenApiParam } from '../util/from-query-params';

export const featureSearchQueryParameters = [
    {
        name: 'query',
        schema: {
            default: '',
            type: 'string' as const,
            example: 'feature_a',
        },
        description: 'The search query for the feature or tag',
        in: 'query' as const,
    },
    {
        name: 'projectId',
        schema: {
            default: '',
            type: 'string' as const,
            example: 'default',
        },
        description: 'Id of the project where search is performed',
        in: 'query' as const,
    },
];

export type FeatureSearchQueryParameters = FromQueryParams<
    typeof featureSearchQueryParameters
>;
