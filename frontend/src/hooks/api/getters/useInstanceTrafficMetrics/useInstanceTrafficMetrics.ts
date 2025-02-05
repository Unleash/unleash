import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type {
    TrafficUsageDataSegmentedCombinedSchema,
    TrafficUsageDataSegmentedSchema,
} from 'openapi';
import { cleanTrafficData } from 'utils/traffic-calculations';

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

export type InstanceTrafficMetricsResponse2 = {
    refetch: () => void;
    result:
        | { state: 'success'; data: TrafficUsageDataSegmentedCombinedSchema }
        | { state: 'error'; error: Error }
        | { state: 'loading' };
};

export const useTrafficSearch = (
    grouping: 'monthly' | 'daily',
    {
        from,
        to,
    }: {
        from: string;
        to: string;
    },
): InstanceTrafficMetricsResponse2 => {
    const apiPath = `api/admin/metrics/traffic-search?grouping=${grouping}&from=${from}&to=${to}`;

    const { data, error, mutate } = useSWR(formatApiPath(apiPath), fetcher);

    return useMemo(() => {
        const result = data
            ? { state: 'success' as const, usage: cleanTrafficData(data) }
            : error
              ? { state: 'error' as const, error }
              : { state: 'loading' as const };
        return {
            refetch: () => mutate(),
            result,
        };
    }, [data, error, mutate]);
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Instance Metrics'))
        .then((res) => res.json());
};
