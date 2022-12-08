import useSWR, { BareFetcher, Key, SWRConfiguration, SWRResponse } from 'swr';

export const useConditionalSWR = <Data = any, Error = any, T = boolean>(
    condition: T,
    fallback: Data,
    key: Key,
    fetcher: BareFetcher<Data>,
    options: SWRConfiguration = {}
): SWRResponse<Data, Error> => {
    const result = useSWR(condition ? key : null, fetcher, options);

    return {
        ...result,
        error: condition ? result.error : undefined,
        data: condition ? result.data : fallback,
    };
};
