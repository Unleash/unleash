import type { FromQueryParams } from '../util/from-query-params.js';

export const featureSearchQueryParameters = [
    {
        name: 'query',
        schema: {
            type: 'string',
            example: 'feature_a',
        },
        description: 'The search query for the feature name or tag',
        in: 'query',
    },
    {
        name: 'project',
        schema: {
            type: 'string',
            example: 'IS:default',
            pattern:
                '^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
        },
        description:
            'Id of the project where search and filter is performed. The project id can be specified with an operator. The supported operators are IS, IS_NOT, IS_ANY_OF, IS_NONE_OF.',
        in: 'query',
    },
    {
        name: 'state',
        schema: {
            type: 'string',
            example: 'IS:active',
            pattern:
                '^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
        },
        description:
            'The state of the feature active/stale. The state can be specified with an operator. The supported operators are IS, IS_NOT, IS_ANY_OF, IS_NONE_OF.',
        in: 'query',
    },
    {
        name: 'lifecycle',
        schema: {
            type: 'string',
            example: 'IS:initial',
            pattern:
                '^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
        },
        description:
            'The lifecycle stage of the feature. The stagee can be specified with an operator. The supported operators are IS, IS_NOT, IS_ANY_OF, IS_NONE_OF.',
        in: 'query',
    },
    {
        name: 'type',
        schema: {
            type: 'string',
            example: 'IS:release',
            pattern:
                '^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
        },
        description:
            'The feature flag type to filter by. The type can be specified with an operator. The supported operators are IS, IS_NOT, IS_ANY_OF, IS_NONE_OF.',
        in: 'query',
    },
    {
        name: 'createdBy',
        schema: {
            type: 'string',
            example: 'IS:1',
            pattern:
                '^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
        },
        description:
            'The feature flag creator to filter by. The creators can be specified with an operator. The supported operators are IS, IS_NOT, IS_ANY_OF, IS_NONE_OF.',
        in: 'query',
    },
    {
        name: 'tag',
        schema: {
            type: 'string',
            pattern:
                '^(INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL):([^:,]+:.+?)(,\\s*[^:,]+:.+?)*$',
            example: 'INCLUDE:simple:my_tag',
        },
        description:
            'The list of feature tags to filter by. Feature tag has to specify a type and a value joined with a colon.',
        in: 'query',
    },
    {
        name: 'segment',
        schema: {
            type: 'string',
            pattern:
                '^(INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL):(.*?)(,([a-zA-Z0-9_]+))*$',
            example: 'INCLUDE:pro-users',
        },
        description:
            'The list of segments with operators to filter by. The segment valid operators are INCLUDE, DO_NOT_INCLUDE, INCLUDE_ALL_OF, INCLUDE_ANY_OF, EXCLUDE_IF_ANY_OF, EXCLUDE_ALL.',
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
        name: 'offset',
        schema: {
            type: 'string',
            example: '50',
        },
        description:
            'The number of features to skip when returning a page. By default it is set to 0.',
        in: 'query',
    },
    {
        name: 'limit',
        schema: {
            type: 'string',
            example: '50',
        },
        description:
            'The number of feature environments to return in a page. By default it is set to 50.',
        in: 'query',
    },
    {
        name: 'sortBy',
        schema: {
            type: 'string',
            example: 'type',
        },
        description:
            'The field to sort the results by. By default it is set to "createdAt".',
        in: 'query',
    },
    {
        name: 'sortOrder',
        schema: {
            type: 'string',
            enum: ['asc', 'desc'] as any,
            example: 'desc',
        },
        description:
            'The sort order for the sortBy. By default it is det to "asc".',
        in: 'query',
    },
    {
        name: 'favoritesFirst',
        schema: {
            type: 'string',
            example: 'true',
        },
        description:
            'The flag to indicate if the favorite features should be returned first. By default it is set to false.',
        in: 'query',
    },
    {
        name: 'archived',
        schema: {
            type: 'string',
            example: 'IS:true',
            pattern: '^IS:(true|false)$',
        },
        description:
            'Whether to get results for archived feature flags or active feature flags. If `IS:true`, Unleash will return only archived flags. If `IS:false`, it will return only active flags.',
        in: 'query',
    },
    {
        name: 'createdAt',
        schema: {
            type: 'string',
            example: 'IS_ON_OR_AFTER:2023-01-28',
            pattern: '^(IS_BEFORE|IS_ON_OR_AFTER):\\d{4}-\\d{2}-\\d{2}$',
        },
        description:
            'The date the feature was created. The date can be specified with an operator. The supported operators are IS_BEFORE, IS_ON_OR_AFTER.',
        in: 'query',
    },
    {
        name: 'lastSeenAt',
        schema: {
            type: 'string',
            example: 'IS_ON_OR_AFTER:2023-01-28',
            pattern: '^(IS_BEFORE|IS_ON_OR_AFTER):\\d{4}-\\d{2}-\\d{2}$',
        },
        description:
            'The date the feature was last seen from metrics. The date can be specified with an operator. The supported operators are IS_BEFORE, IS_ON_OR_AFTER.',
        in: 'query',
    },
] as const;

export type FeatureSearchQueryParameters = Partial<
    FromQueryParams<typeof featureSearchQueryParameters>
>;
