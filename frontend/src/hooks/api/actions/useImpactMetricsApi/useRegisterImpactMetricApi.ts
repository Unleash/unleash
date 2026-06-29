import { useCallback } from 'react';
import useAPI from '../useApi/useApi.js';
import type { RegisterImpactMetricSchema } from 'openapi/models/index.js';

export const useRegisterImpactMetricApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const registerImpactMetric = useCallback(
        async (params: RegisterImpactMetricSchema) => {
            const req = createRequest(
                'api/admin/impact-metrics/register',
                {
                    method: 'POST',
                    body: JSON.stringify(params),
                },
                'registerImpactMetric',
            );

            return makeRequest(req.caller, req.id);
        },
        [makeRequest, createRequest],
    );

    return {
        registerImpactMetric,
        errors,
        loading,
    };
};
