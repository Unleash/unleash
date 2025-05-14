import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { ProjectDoraMetricsSchema } from 'openapi';

interface IUseProjectDoraMetricsOutput {
    dora: ProjectDoraMetricsSchema;
    loading: boolean;
    error?: Error;
    refetchDoraMetrics: () => void;
}

export const useProjectDoraMetrics = (
    projectId: string,
    options: SWRConfiguration = {},
): IUseProjectDoraMetricsOutput => {
    const KEY = `api/admin/projects/${projectId}/dora`;
    const path = formatApiPath(KEY);

    const fetcher = () => {
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Dora metrics'))
            .then((res) => res.json());
    };

    const { data, error } = useSWR(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetchDoraMetrics = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        dora: data || {},
        error,
        loading,
        refetchDoraMetrics,
    };
};
