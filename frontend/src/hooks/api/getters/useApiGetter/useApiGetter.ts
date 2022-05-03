import useSWR, { SWRConfiguration, mutate } from 'swr';
import { useCallback } from 'react';

type CacheKey =
    | 'apiAdminFeaturesGet'
    | 'apiAdminArchiveFeaturesGet'
    | ['apiAdminArchiveFeaturesGet', string?];

interface IUseApiGetterOutput<T> {
    data?: T;
    refetch: () => void;
    error?: Error | undefined;
    loading: boolean;
}

export const useApiGetter = <T>(
    cacheKey: CacheKey,
    fetcher: () => Promise<T>,
    options?: SWRConfiguration
): IUseApiGetterOutput<T> => {
    const { data, error } = useSWR<T>(cacheKey, fetcher, options);

    const refetch = useCallback(() => {
        mutate(cacheKey).catch(console.warn);
    }, [cacheKey]);

    return {
        data,
        error,
        refetch,
        loading: !error && !data,
    };
};
