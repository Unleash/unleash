import useSWR, { SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useClearSWRCache } from '../../../useClearSWRCache';

type GenericSearchOutput<T> = {
    loading: boolean;
    initialLoad: boolean;
    error: string;
    total: number;
} & T;

export function createPaginatedHook<T extends { total?: number }>(
    customFallbackData: T,
    defaultPrefixKey = '',
) {
    return (
        params: Record<string, any> = {},
        dynamicPrefixKey: string = '',
        options: SWRConfiguration = {},
    ): GenericSearchOutput<T> => {
        const urlSearchParams = new URLSearchParams(
            Array.from(
                Object.entries(params)
                    .filter(([_, value]) => !!value)
                    .map(([key, value]) => [key, value.toString()]),
            ),
        ).toString();

        const prefix = dynamicPrefixKey || defaultPrefixKey;
        const KEY = `${prefix}${urlSearchParams}`;
        useClearSWRCache(KEY, prefix);

        const fetcher = async () => {
            return fetch(formatApiPath(KEY), {
                method: 'GET',
            })
                .then(handleErrorResponses('Paginated data'))
                .then((res) => res.json());
        };

        const { data, error, isLoading } = useSWR(KEY, fetcher, {
            ...options,
        });

        const returnData = data || customFallbackData;
        return {
            ...returnData,
            total: data?.total || 0,
            error,
            loading: isLoading,
        };
    };
}
