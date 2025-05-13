import { formatApiPath } from '../../../../utils/formatPath.js';
import type { ITrafficBundles } from '../../../../interfaces/trafficBundles.js';
import useSWR from 'swr';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useMemo } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig.js';

type IUseTrafficBundlesOutput = {
    trafficBundles: ITrafficBundles;
    loading: boolean;
    error?: Error;
    refetch: () => void;
};

const DEFAULT_TRAFFIC_INCLUDED_PAYG = 53;
const DEFAULT_TRAFFIC_INCLUDED_ENTERPRISE = 259;
const DEFAULT_TRAFFIC_MULTIPLIER = 1_000_000;

const defaultIncludedTraffic = (
    isEnterprise: boolean,
    billing?: string,
): number => {
    if (!isEnterprise || billing === 'pay-as-you-go') {
        return DEFAULT_TRAFFIC_INCLUDED_PAYG;
    }
    return DEFAULT_TRAFFIC_INCLUDED_ENTERPRISE;
};

function includedTraffic(
    includedTraffic: number | undefined,
    isEnterprise: boolean,
    billing?: string,
): number {
    if (includedTraffic === undefined) {
        return defaultIncludedTraffic(isEnterprise, billing);
    }
    return includedTraffic;
}

function purchasedTraffic(purchasedTraffic: number | undefined): number {
    if (purchasedTraffic === undefined) {
        return 0;
    }
    return purchasedTraffic;
}

export const useTrafficBundles = (): IUseTrafficBundlesOutput => {
    const { isEnterprise, uiConfig } = useUiConfig();
    const path = formatApiPath('/api/instance/trafficBundles');
    const { data, error, mutate } = useSWR<ITrafficBundles>(path, fetcher);

    const trafficBundles = useMemo(() => {
        return {
            includedTraffic:
                includedTraffic(
                    data?.includedTraffic,
                    isEnterprise(),
                    uiConfig.billing,
                ) * DEFAULT_TRAFFIC_MULTIPLIER,
            purchasedTraffic:
                purchasedTraffic(data?.purchasedTraffic) *
                DEFAULT_TRAFFIC_MULTIPLIER,
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
