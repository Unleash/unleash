import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';

interface IFeaturesTotalMetricsCount {
    environment: string;
    total: number;
}

export const useFeatureMetricsTotal = (featureId: string) => {
    const { uiConfig } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR<
        IFeaturesTotalMetricsCount[]
    >(
        Boolean(uiConfig.flags.totalMetricsCount),
        [],
        formatApiPath(`api/admin/client-metrics/features/${featureId}/total`),
        fetcher
    );

    return {
        data,
        loading: !error && !data,
        refetchFeatureMetrics: mutate,
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Total metrics count'))
        .then(res => res.json());
};
