import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { TrafficUsageDataSegmentedCombinedSchema } from 'openapi';
import { cleanTrafficData } from 'utils/traffic-calculations';

export type InstanceTrafficMetricsResponse = {
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
): InstanceTrafficMetricsResponse => {
    const apiPath = `api/admin/metrics/traffic?grouping=${grouping}&from=${from}&to=${to}`;

    const { data, error, mutate } = useSWR(formatApiPath(apiPath), fetcher);

    return useMemo(() => {
        const result = data
            ? { state: 'success' as const, data: cleanTrafficData(data) }
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
