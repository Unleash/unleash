import type { FromQueryParams } from '../util/from-query-params.js';

export const eventSearchQueryParameters = [
    {
        name: 'query',
        schema: {
            type: 'string',
            example: 'admin@example.com',
        },
        description:
            'Find events by a free-text search query. The query will be matched against the event data payload (if any).',
        in: 'query',
    },
    {
        name: 'id',
        schema: {
            type: 'string',
            example: 'IS:123',
            pattern: '^(IS|IS_ANY_OF):(.*?)(,([0-9]+))*$',
        },
        description:
            'Filter by event ID using supported operators: IS, IS_ANY_OF.',
        in: 'query',
    },
    {
        name: 'groupId',
        schema: {
            type: 'string',
            example: 'IS:123',
            pattern: '^(IS|IS_ANY_OF):(.*?)(,([0-9]+))*$',
        },
        description:
            'Filter by group ID using supported operators: IS, IS_ANY_OF.',
        in: 'query',
    },
    {
        name: 'feature',
        schema: {
            type: 'string',
            example: 'IS:myfeature',
            pattern: '^(IS|IS_ANY_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
        },
        description:
            'Filter by feature name using supported operators: IS, IS_ANY_OF',
        in: 'query',
    },
    {
        name: 'project',
        schema: {
            type: 'string',
            example: 'IS:default',
            pattern: '^(IS|IS_ANY_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
        },
        description:
            'Filter by projects ID using supported operators: IS, IS_ANY_OF.',
        in: 'query',
    },
    {
        name: 'type',
        schema: {
            type: 'string',
            example: 'IS:change-added',
            pattern: '^(IS|IS_ANY_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
        },
        description:
            'Filter by event type using supported operators: IS, IS_ANY_OF.',
        in: 'query',
    },

    {
        name: 'createdBy',
        schema: {
            type: 'string',
            example: 'IS:2',
            pattern: '^(IS|IS_ANY_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
        },
        description:
            'Filter by the ID of the event creator, using supported operators: IS, IS_ANY_OF.',
        in: 'query',
    },
    {
        name: 'from',
        schema: {
            type: 'string',
            example: 'IS:2024-01-01',
            pattern: '^(IS):\\d{4}-\\d{2}-\\d{2}$',
        },
        description:
            'The starting date of the creation date range in IS:yyyy-MM-dd format',
        in: 'query',
    },
    {
        name: 'to',
        schema: {
            type: 'string',
            example: 'IS:2024-01-31',
            pattern: '^(IS):\\d{4}-\\d{2}-\\d{2}$',
        },
        description:
            'The ending date of the creation date range in IS:yyyy-MM-dd format',
        in: 'query',
    },
    {
        name: 'offset',
        schema: {
            type: 'string',
            example: '50',
            default: '0',
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
            default: '50',
        },
        description:
            'The number of feature environments to return in a page. By default it is set to 50. The maximum is 1000.',
        in: 'query',
    },
    {
        name: 'environment',
        schema: {
            type: 'string',
            example: 'IS:production',
            pattern: '^(IS|IS_ANY_OF):(.*?)(,([a-zA-Z0-9_]+))*$',
        },
        description:
            'Filter by environment name using supported operators: IS, IS_ANY_OF.',
        in: 'query',
    },
] as const;

export type EventSearchQueryParameters = Partial<
    FromQueryParams<typeof eventSearchQueryParameters>
>;
