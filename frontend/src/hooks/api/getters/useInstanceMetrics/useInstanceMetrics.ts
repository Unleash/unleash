import useSWR, { SWRConfiguration } from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { RequestsPerSecondSchema } from 'openapi';

export interface IInstanceMetricsResponse {
    metrics: RequestsPerSecondSchema;

    refetch: () => void;

    loading: boolean;

    error?: Error;
}

export const useInstanceMetrics = (
    options: SWRConfiguration = {}
): IInstanceMetricsResponse => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/metrics/rps`),
        fetcher,
        options
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
