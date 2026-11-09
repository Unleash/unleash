import type { FromQueryParams } from '../util/from-query-params.js';

export const flagCreatorsQueryParameters = [
    {
        name: 'q',
        schema: {
            type: 'string',
            example: 'ali',
        },
        description:
            'Matches user name as a substring, and username or email as a prefix.',
        in: 'query',
    },
    {
        name: 'offset',
        schema: {
            type: 'string',
            example: '50',
        },
        description:
            'The number of flag creators to skip when returning a page. By default it is set to 0.',
        in: 'query',
    },
    {
        name: 'limit',
        schema: {
            type: 'string',
            example: '50',
        },
        description:
            'The number of flag creators to return in a page. By default it is set to 50.',
        in: 'query',
    },
] as const;

export type FlagCreatorsQueryParameters = Partial<
    FromQueryParams<typeof flagCreatorsQueryParameters>
>;
