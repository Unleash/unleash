import type { FromQueryParams } from '../util/from-query-params.js';

export const userAccessLogQueryParameters = [
    {
        name: 'offset',
        schema: {
            type: 'string',
            example: '50',
            default: '0',
        },
        description:
            'The number of access log entries to skip when returning a page. By default it is set to 0.',
        in: 'query',
    },
    {
        name: 'limit',
        schema: {
            type: 'string',
            example: '25',
            default: '25',
        },
        description:
            'The number of access log entries to return in a page. By default it is set to 25. The maximum is 100.',
        in: 'query',
    },
    {
        name: 'sortBy',
        schema: {
            type: 'string',
            enum: ['createdAt', 'removedAt', 'name', 'status'] satisfies (
                | 'createdAt'
                | 'removedAt'
                | 'name'
                | 'status'
            )[],
            example: 'createdAt',
            default: 'createdAt',
        },
        description:
            'The field to sort the results by. By default it is set to "createdAt".',
        in: 'query',
    },
    {
        name: 'sortOrder',
        schema: {
            type: 'string',
            enum: ['asc', 'desc'] satisfies ('asc' | 'desc')[],
            example: 'desc',
            default: 'desc',
        },
        description:
            'The sort order for the sortBy field. By default it is set to "desc".',
        in: 'query',
    },
] as const;

export type UserAccessLogQueryParameters = Partial<
    FromQueryParams<typeof userAccessLogQueryParameters>
>;
