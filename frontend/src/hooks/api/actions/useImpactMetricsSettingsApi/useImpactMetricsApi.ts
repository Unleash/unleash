import { useCallback } from 'react';
import useAPI from '../useApi/useApi.js';
import type { ImpactMetricsConfigSchema } from 'openapi/models/impactMetricsConfigSchema.js';

export const useImpactMetricsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createImpactMetric = useCallback(
        async (config: ImpactMetricsConfigSchema) => {
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

    return {
        createImpactMetric,
        errors,
        loading,
    };
};
