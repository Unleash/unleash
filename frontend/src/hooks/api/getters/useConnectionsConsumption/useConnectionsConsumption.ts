import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { MeteredConnectionsSchema } from 'openapi';

export type MeteredConnectionsResponse = {
    refetch: () => void;
    result:
        | { state: 'success'; data: MeteredConnectionsSchema }
        | { state: 'error'; error: Error }
        | { state: 'loading' };
};

export const useConnectionsConsumption = (
    grouping: 'monthly' | 'daily',
    {
        from,
        to,
    }: {
        from: string;
        to: string;
    },
): MeteredConnectionsResponse => {
    const apiPath = `api/admin/metrics/connection?grouping=${grouping}&from=${from}&to=${to}`;

    const { data, error, mutate } = useSWR(formatApiPath(apiPath), fetcher);

    return useMemo(() => {
        const result = data
            ? { state: 'success' as const, data: data }
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
        .then(handleErrorResponses('Metered Connections Metrics'))
        .then((res) => res.json());
};
