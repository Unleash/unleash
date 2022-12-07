import useSWR, { BareFetcher, Key, SWRConfiguration, SWRResponse } from 'swr';
import { useEffect } from 'react';

export const useConditionalSWR = <Data = any, Error = any, T = boolean>(
    condition: T,
    fallback: Data,
    key: Key,
    fetcher: BareFetcher<Data>,
    options: SWRConfiguration = {}
): SWRResponse<Data, Error> => {
    const result = useSWR(
        key,
        (path: string) =>
            condition ? fetcher(path) : Promise.resolve(fallback),
        options
    );

    useEffect(() => {
        result.mutate();
    }, [condition]);

    return result;
};
