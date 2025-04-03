import { formatApiPath } from '../../../../utils/formatPath';
import type { ITrafficBundles } from '../../../../interfaces/trafficBundles';
import useSWR from 'swr';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useMemo } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig';

type IUseTrafficBundlesOutput = {
    trafficBundles: ITrafficBundles;
    loading: boolean;
    error?: Error;
    refetch: () => void;
};

const defaultIncludedTraffic = (
    isEnterprise: boolean,
    billing?: string,
): number => {
    if (!isEnterprise || billing === 'pay-as-you-go') {
        return 53;
    }
    return 259;
};

export const useTrafficBundles = (): IUseTrafficBundlesOutput => {
    const { isEnterprise, uiConfig } = useUiConfig();
    const path = formatApiPath('/api/instance/trafficBundles');
    const { data, error, mutate } = useSWR<ITrafficBundles>(path, fetcher);

    const trafficBundles = useMemo(() => {
        return {
            includedTraffic:
                data?.includedTraffic ||
                defaultIncludedTraffic(isEnterprise(), uiConfig.billing),
            purchasedTraffic: data?.purchasedTraffic || 0,
        };
    }, [data]);
    return {
        trafficBundles,
        loading: !error && !data,
        refetch: mutate,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('configuration'))
        .then((res) => res.json());
};
