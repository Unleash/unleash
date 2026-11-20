import type { FromQueryParams } from '../util/from-query-params.js';

export const apiTokensQueryParameters = [
    {
        name: 'appName',
        schema: {
            type: 'string',
            example: 'IS:my-application-name',
            pattern: '^IS:.+$',
        },
        description:
            'Filter by the name of the application the tokens are linked to, using supported operators: IS. Everything after `IS:` is one exact, case-sensitive application name, including any commas or spaces. Percent-encode the value (for example with `encodeURIComponent`), since a `+` is read as a space. Only user-created tokens linked to that application are returned, so legacy (v1) and unlinked tokens never match. An unknown application returns an empty list.',
        in: 'query',
    },
] as const;

export type ApiTokensQueryParameters = Partial<
    FromQueryParams<typeof apiTokensQueryParameters>
>;
