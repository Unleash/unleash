import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { TrafficUsageDataSegmentedSchema } from 'openapi';

export interface IInstanceTrafficMetricsResponse {
    usage: TrafficUsageDataSegmentedSchema;

    refetch: () => void;

    loading: boolean;

    error?: Error;
}

export const useInstanceTrafficMetrics = (
    period: string,
): IInstanceTrafficMetricsResponse => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/metrics/traffic/${period}`),
        fetcher,
    );

    return useMemo(
        () => ({
            usage: data,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Instance Metrics'))
        .then((res) => res.json());
};
