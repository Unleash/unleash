import useSWR, { SWRConfiguration, Key } from 'swr';
import { useCallback } from 'react';

interface IUseApiGetterOutput<T> {
    data?: T;
    refetch: () => void;
    error?: Error | undefined;
    loading: boolean;
}

export const useApiGetter = <T>(
    cacheKey: Key,
    fetcher: () => Promise<T>,
    options?: SWRConfiguration
): IUseApiGetterOutput<T> => {
    const { data, error, mutate } = useSWR<T>(cacheKey, fetcher, options);

    const refetch = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        data,
        error,
        refetch,
        loading: !error && !data,
    };
};
