import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

interface InstanceStats {
    instanceId: string;
    timestamp: Date;
    versionOSS: string;
    versionEnterprise?: string;
    users: number;
    featureToggles: number;
    projects: number;
    contextFields: number;
    roles: number;
    groups: number;
    environments: number;
    segments: number;
    strategies: number;
    featureExports: number;
    featureImports: number;
    SAMLenabled: boolean;
    OIDCenabled: boolean;
}

export interface IInstanceStatsResponse {
    stats?: InstanceStats;
    refetchGroup: () => void;
    loading: boolean;
    error?: Error;
}

export const useInstanceStats = (): IInstanceStatsResponse => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/instance-admin/statistics`),
        fetcher
    );

    return useMemo(
        () => ({
            stats: data,
            loading: !error && !data,
            refetchGroup: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Instance Stats'))
        .then(res => res.json());
};
