import type { RunnableToolFunctionWithParse } from 'openai/lib/RunnableFunction';
import type { IUser } from '../../../types';
import type { FeatureSearchService } from '../../feature-search/feature-search-service';
import { normalizeQueryParams } from '../../feature-search/search-utils';

type searchFlagOperationalParams = {
    featureSearchService: FeatureSearchService;
    user: IUser;
};

type searchFlagParams = {
    query?: string;
    project?: string;
    type?: string;
    tag?: string;
    segment?: string;
    createdAt?: string;
    state?: string;
    status?: string[];
};

type searchFlagFunctionParams = searchFlagOperationalParams & searchFlagParams;

const searchFlagFunction = async ({
    featureSearchService,
    user,
    query,
    project,
    type,
    tag,
    segment,
    createdAt,
    state,
    status,
}: searchFlagFunctionParams) => {
    try {
        const userId = user.id;
        const {
            normalizedQuery,
            normalizedSortOrder,
            normalizedOffset,
            normalizedLimit,
        } = normalizeQueryParams(
            { query },
            {
                limitDefault: 50,
                maxLimit: 100,
            },
        );
        const normalizedStatus = status
            ?.map((tag) => tag.split(':'))
            .filter(
                (tag) =>
                    tag.length === 2 &&
                    ['enabled', 'disabled'].includes(tag[1]),
            );

        const response = await featureSearchService.search({
            searchParams: normalizedQuery,
            project,
            type,
            userId,
            tag,
            segment,
            state,
            createdAt,
            status: normalizedStatus,
            offset: normalizedOffset,
            limit: normalizedLimit,
            sortOrder: normalizedSortOrder,
            favoritesFirst: true,
        });

        return response;
    } catch (error) {
        return error;
    }
};

export const searchFlag = ({
    featureSearchService,
    user,
}: searchFlagOperationalParams): RunnableToolFunctionWithParse<searchFlagParams> => ({
    type: 'function',
    function: {
        function: (params: searchFlagParams) =>
            searchFlagFunction({ ...params, featureSearchService, user }),
        name: 'searchFlag',
        description:
            'Search a feature flag by name, project, environment, and enabled status',
        parse: JSON.parse,
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search by query',
                    examples: ['feature_a'],
                },
                project: {
                    type: 'string',
                    description:
                        'Search by project. Operators such as IS, IS_NOT, IS_ANY_OF, IS_NONE_OF are supported',
                    pattern:
                        '^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
                    examples: ['IS:default'],
                },
                state: {
                    type: 'string',
                    description:
                        'Search by state (e.g., active/stale). Operators such as IS, IS_NOT, IS_ANY_OF, IS_NONE_OF are supported',
                    pattern:
                        '^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
                    examples: ['IS:active'],
                },
                type: {
                    type: 'string',
                    description:
                        'Search by type. Operators such as IS, IS_NOT, IS_ANY_OF, IS_NONE_OF are supported',
                    pattern:
                        '^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
                    examples: ['IS:release'],
                },
                tag: {
                    type: 'string',
                    description:
                        'Search by tags. Tags must specify a type and a value, joined with a colon. Operators such as INCLUDE, DO_NOT_INCLUDE, INCLUDE_ALL_OF, INCLUDE_ANY_OF, EXCLUDE_IF_ANY_OF, EXCLUDE_ALL are supported',
                    pattern:
                        '^(INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL):([^:,]+:.+?)(,\\s*[^:,]+:.+?)*$',
                    examples: ['INCLUDE:simple:my_tag'],
                },
                segment: {
                    type: 'string',
                    description:
                        'Search by segments. Operators such as INCLUDE, DO_NOT_INCLUDE, INCLUDE_ALL_OF, INCLUDE_ANY_OF, EXCLUDE_IF_ANY_OF, EXCLUDE_ALL are supported',
                    pattern:
                        '^(INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL):(.*?)(,([a-zA-Z0-9_]+))*$',
                    examples: ['INCLUDE:pro-users'],
                },
                createdAt: {
                    type: 'string',
                    description:
                        'Search by creation date. Operators such as IS_BEFORE or IS_ON_OR_AFTER are supported',
                    pattern:
                        '^(IS_BEFORE|IS_ON_OR_AFTER):\\d{4}-\\d{2}-\\d{2}$',
                    examples: ['IS_ON_OR_AFTER:2023-01-28'],
                },
                status: {
                    type: 'array',
                    items: {
                        type: 'string',
                        description:
                            'Search by environment status. The environment and status are joined by a colon.',
                        examples: ['production:enabled'],
                    },
                },
            },
            required: [],
        },
    },
});
