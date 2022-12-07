import { BareFetcher, Key, SWRConfiguration } from 'swr';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';

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
