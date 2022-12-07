import useSWR, { BareFetcher, Key, SWRConfiguration, SWRResponse } from 'swr';
import { useEffect } from 'react';

export const useConditionalSWR = <Data = any, Error = any, T = boolean>(
    key: Key,
    fetcher: BareFetcher<Data>,
    condition: T,
    options: SWRConfiguration = {}
): SWRResponse<Data, Error> => {
    const result = useSWR(key, fetcher, options);

    useEffect(() => {
        result.mutate();
    }, [condition]);

    return result;
};
