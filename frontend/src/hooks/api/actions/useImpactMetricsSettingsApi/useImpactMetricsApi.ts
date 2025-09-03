import { useCallback } from 'react';
import useAPI from '../useApi/useApi.js';
import type { CreateImpactMetricsConfigSchema } from 'openapi';

export const useImpactMetricsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createImpactMetric = useCallback(
        async (config: CreateImpactMetricsConfigSchema) => {
            const path = `api/admin/impact-metrics/config`;
            const req = createRequest(
                path,
                {
                    method: 'POST',
                    body: JSON.stringify(config),
                },
                'updateImpactMetric',
            );

            return makeRequest(req.caller, req.id);
        },
        [makeRequest, createRequest],
    );

    const deleteImpactMetric = useCallback(
        async (metricId: string) => {
            const path = `api/admin/impact-metrics/config/${metricId}`;
            const req = createRequest(
                path,
                {
                    method: 'DELETE',
                },
                'deleteImpactMetric',
            );

            return makeRequest(req.caller, req.id);
        },
        [makeRequest, createRequest],
    );

    return {
        createImpactMetric,
        deleteImpactMetric,
        errors,
        loading,
    };
};
