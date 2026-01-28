import { useMemo } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig.js';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import { InstancePrices } from 'interfaces/instance.js';
import merge from 'deepmerge';

const DEFAULT_DATA: InstancePrices = {
    pro: {
        base: 80,
        seat: 15,
        traffic: 5,
    },
    payg: {
        seat: 75,
        traffic: 5,
    },
};

export const useInstancePrices = () => {
    const { uiConfig: { flags: { UNLEASH_CLOUD } } } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR<InstancePrices>(
        Boolean(UNLEASH_CLOUD),
        DEFAULT_DATA,
        formatApiPath('api/instance/prices'),
        fetcher,
    );

    return useMemo(
        () => ({
            instancePrices: mergeAll([DEFAULT_DATA, data || {}]),
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Instance prices'))
        .then((res) => res.json());
};

const mergeAll = <T>(objects: Partial<T>[]): T => {
    return merge.all<T>(objects.filter((i) => i));
}
