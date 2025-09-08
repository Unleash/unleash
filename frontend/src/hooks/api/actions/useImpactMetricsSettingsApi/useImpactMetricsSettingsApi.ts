import { useCallback } from 'react';
import useAPI from '../useApi/useApi.js';
import type { ImpactMetricsState } from 'component/impact-metrics/types.ts';

/**
 * @deprecated use `useImpactMetricsApi()` instead
 */
export const useImpactMetricsSettingsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const updateSettings = useCallback(
        async (settings: ImpactMetricsState) => {
            const path = `api/admin/impact-metrics/settings`;
            const req = createRequest(
                path,
                {
                    method: 'PUT',
                    body: JSON.stringify(settings),
                },
                'updateImpactMetricsSettings',
            );

            return makeRequest(req.caller, req.id);
        },
        [makeRequest, createRequest],
    );

    return {
        updateSettings,
        errors,
        loading,
    };
};
