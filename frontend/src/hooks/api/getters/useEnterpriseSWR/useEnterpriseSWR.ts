import useSWR, { BareFetcher, Key, SWRResponse } from 'swr';
import { useEffect } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig';

export const useConditionalSWR = <Data = any, Error = any, T = boolean>(
    key: Key,
    fetcher: BareFetcher<Data>,
    condition: T
): SWRResponse<Data, Error> => {
    const result = useSWR(key, fetcher);

    useEffect(() => {
        result.mutate();
    }, [condition]);

    return result;
};

export const useEnterpriseSWR = <Data = any, Error = any>(
    key: Key,
    fetcher: BareFetcher<Data>,
    ossFallback: Data
) => {
    const { isOss } = useUiConfig();

    const result = useConditionalSWR(
        key,
        (path: string) =>
            isOss() ? Promise.resolve(ossFallback) : fetcher(path),
        isOss()
    );

    return result;
};
