import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IMaintenancePayload } from 'hooks/api/actions/useMaintenanceApi/useMaintenanceApi';

export interface IUseMaintenance extends IMaintenancePayload {
    enabled: boolean;
    refetchMaintenance: () => void;
    loading: boolean;
    status?: number;
    error?: Error;
}

export const useMaintenance = (): IUseMaintenance => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/maintenance`),
        fetcher
    );

    return useMemo(
        () => ({
            enabled: Boolean(data?.enabled),
            loading: !error && !data,
            refetchMaintenance: mutate,
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Maintenance'))
        .then(res => res.json());
};
