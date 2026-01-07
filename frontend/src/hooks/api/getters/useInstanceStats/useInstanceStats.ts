import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { InstanceAdminStatsSchema } from 'openapi';

export interface IInstanceStatsResponse {
    stats?: InstanceAdminStatsSchema;
    refetchGroup: () => void;
    loading: boolean;
    error?: Error;
}

export const useInstanceStats = (): IInstanceStatsResponse => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/instance-admin/statistics`),
        fetcher,
    );

    return useMemo(
        () => ({
            stats: data,
            loading: !error && !data,
            refetchGroup: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Instance Stats'))
        .then((res) => res.json());
};
