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
    {
        name: 'tag',
        schema: {
            type: 'array',
            items: {
                type: 'string',
                example: 'simple:my_tag',
            },
        },
        description:
            'The list of feature tags to filter by. Feature tag has to specify a type and a value joined with a colon.',
        in: 'query',
    },
    {
        name: 'status',
        schema: {
            type: 'array',
            items: {
                type: 'string',
                example: 'production:enabled',
            },
        },
        description:
            'The list of feature environment status to filter by. Feature environment has to specify a name and a status joined with a colon.',
        in: 'query',
    },
    {
        name: 'cursor',
        schema: {
            type: 'string',
            example: '2023-10-31T09:21:04.056Z',
        },
        description:
            'The last feature create at date the client has seen. Used for cursor-based pagination. Empty if starting from the beginning.',
        in: 'query',
    },
    {
        name: 'limit',
        schema: {
            type: 'string',
            example: '10',
        },
        description:
            'The number of results to return in a page. By default it is set to 50',
        in: 'query',
    },
] as const;

export type FeatureSearchQueryParameters = Partial<
    FromQueryParams<typeof featureSearchQueryParameters>
>;
