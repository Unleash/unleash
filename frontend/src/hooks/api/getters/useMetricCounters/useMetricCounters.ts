import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useMemo } from 'react';

export interface IMetricsCount {
    name: string;
    value: number;
    timestamp: Date;
    labels: Record<string, string>;
}

export interface IMetricsResponse {
    metrics: IMetricsCount[];
    count: number;
    metricNames: string[];
}

export const useMetricCounters = () => {
    const { data, error, mutate } = useConditionalSWR<IMetricsResponse>(
        true,
        { metrics: [], count: 0, metricNames: [] },
        formatApiPath('api/admin/custom-metrics'),
        fetcher,
    );

    return useMemo(
        () => ({
            counters: data ?? { metrics: [], count: 0, metricNames: [] },
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Metric counters'))
        .then((res) => res.json());
};
