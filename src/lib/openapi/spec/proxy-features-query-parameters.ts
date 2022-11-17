import { FromQueryParams } from '../util/from-query-params';

export const proxyFeaturesQueryParameters = [
    {
        name: 'all',
        schema: {
            default: false,
            anyOf: [
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                    minLength: 1,
                },
                {
                    type: 'number',
                },
            ],
        },
        description: 'Whether all feature toggles should be returned',
        in: 'query',
    },
] as const;

export type ProxyFeaturesQueryParameters = FromQueryParams<
    typeof proxyFeaturesQueryParameters
>;
