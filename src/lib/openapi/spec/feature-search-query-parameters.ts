import { FromQueryParams } from '../util/from-query-params';

export const featureSearchQueryParameters = [
    {
        name: 'query',
        schema: {
            type: 'string',
            example: 'feature_a',
        },
        description: 'The search query for the feature or tag',
        in: 'query',
    },
    {
        name: 'projectId',
        schema: {
            type: 'string',
            example: 'default',
        },
        description: 'Id of the project where search and filter is performed',
        in: 'query',
    },
    {
        name: 'type',
        schema: {
            type: 'array',
            items: {
                type: 'string',
                example: 'release',
            },
        },
        description: 'The list of feature types to filter by',
        in: 'query',
    },
] as const;

export type FeatureSearchQueryParameters = Partial<
    FromQueryParams<typeof featureSearchQueryParameters>
>;
