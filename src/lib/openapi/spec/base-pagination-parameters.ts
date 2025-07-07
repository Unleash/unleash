import type { FromQueryParams } from '../util/from-query-params.js';

export const basePaginationParameters = [
    {
        name: 'limit',
        schema: {
            type: 'string',
            example: '50',
        },
        description:
            'The number of results to return in a page. By default it is set to 50.',
        in: 'query',
    },
    {
        name: 'offset',
        schema: {
            type: 'string',
            example: '50',
        },
        description:
            'The number of results to skip when returning a page. By default it is set to 0.',
        in: 'query',
    },
] as const;

export type BasePaginationParameters = Partial<
    FromQueryParams<typeof basePaginationParameters>
>;
