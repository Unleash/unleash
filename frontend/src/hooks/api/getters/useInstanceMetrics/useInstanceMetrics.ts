import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { RequestsPerSecondSchema } from '@server/openapi';

export interface InstanceMetrics {
    clientMetrics: RequestsPerSecondSchema;
    adminMetrics: RequestsPerSecondSchema;
}

export interface IInstanceMetricsResponse {
    metrics: InstanceMetrics;

    refetch: () => void;

    loading: boolean;

    error?: Error;
}

export const useInstanceMetrics = (): IInstanceMetricsResponse => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/metrics/rps`),
        fetcher
    );

    return useMemo(
        () => ({
            metrics: data,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Instance Metrics'))
        .then(res => res.json());
};
