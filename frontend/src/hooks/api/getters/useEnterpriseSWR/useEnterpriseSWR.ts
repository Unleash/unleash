import type { BareFetcher, Key, SWRConfiguration } from 'swr';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import useUiConfig from '../useUiConfig/useUiConfig.js';

export const useEnterpriseSWR = <Data = any, Error = any>(
    fallback: Data,
    key: Key,
    fetcher: BareFetcher<Data>,
    options: SWRConfiguration = {},
) => {
    const { isEnterprise } = useUiConfig();

    const result = useConditionalSWR<Data, Error>(
        isEnterprise(),
        fallback,
        key,
        fetcher,
        options,
    );

    return result;
};
