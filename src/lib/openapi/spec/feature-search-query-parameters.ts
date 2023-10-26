import { FromQueryParams } from '../util/from-query-params';

export const featureSearchQueryParameters = [
    {
        name: 'query',
        schema: {
            default: '',
            type: 'string',
            example: 'feature_a',
        },
        description: 'The search query for the feature or tag',
        in: 'query',
    },
    {
        name: 'projectId',
        schema: {
            default: '',
            type: 'string',
            example: 'default',
        },
        description: 'Id of the project where search is performed',
        in: 'query',
    },
] as const;

export type FeatureSearchQueryParameters = FromQueryParams<
    typeof featureSearchQueryParameters
>;
