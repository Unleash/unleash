import type { FromQueryParams } from '../util/from-query-params.js';

export const projectApplicationsQueryParameters = [
    {
        name: 'query',
        schema: {
            type: 'string',
            example: 'first_app',
        },
        description:
            'The search query for the application name, sdk, environment',
        in: 'query',
    },
    {
        name: 'offset',
        schema: {
            type: 'string',
            example: '50',
        },
        description:
            'The number of applications to skip when returning a page. By default it is set to 0.',
        in: 'query',
    },
    {
        name: 'limit',
        schema: {
            type: 'string',
            example: '50',
        },
        description:
            'The number of applications to return in a page. By default it is set to 50.',
        in: 'query',
    },
    {
        name: 'sortBy',
        schema: {
            type: 'string',
            example: 'type',
        },
        description:
            'The field to sort the results by. By default it is set to "appName".',
        in: 'query',
    },
    {
        name: 'sortOrder',
        schema: {
            type: 'string',
            example: 'desc',
        },
        description:
            'The sort order for the sortBy. By default it is det to "asc".',
        in: 'query',
    },
] as const;

export type ProjectApplicationsQueryParameters = Partial<
    FromQueryParams<typeof projectApplicationsQueryParameters>
>;
