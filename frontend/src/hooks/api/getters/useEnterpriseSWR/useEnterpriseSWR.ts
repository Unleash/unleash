import useSWR, { BareFetcher, Key, SWRConfiguration, SWRResponse } from 'swr';
import { useEffect } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig';

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

export const useEnterpriseSWR = <Data = any, Error = any>(
    key: Key,
    fetcher: BareFetcher<Data>,
    fallback: Data,
    options: SWRConfiguration = {}
) => {
    const { isEnterprise } = useUiConfig();

    const result = useConditionalSWR(
        key,
        (path: string) =>
            isEnterprise() ? fetcher(path) : Promise.resolve(fallback),
        isEnterprise(),
        options
    );

    return result;
};
