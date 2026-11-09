import type { FromQueryParams } from '../util/from-query-params.js';

export const userRecentFlagsQueryParameters = [
    {
        name: 'offset',
        schema: {
            type: 'string',
            example: '100',
        },
        description:
            'The number of flags to skip when returning a page. By default it is set to 0.',
        in: 'query',
    },
    {
        name: 'limit',
        schema: {
            type: 'string',
            example: '100',
        },
        description:
            'The number of flags to return in a page. By default it is set to 100, which is also the maximum.',
        in: 'query',
    },
] as const;

export type UserRecentFlagsQueryParameters = Partial<
    FromQueryParams<typeof userRecentFlagsQueryParameters>
>;
