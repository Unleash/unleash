import { useCallback } from 'react';
import useAPI from '../useApi/useApi.js';
import type { CreateImpactMetricsConfigSchema } from 'openapi';

type UseImpactMetricsApiParams =
    | {
          projectId: string;
          featureName: string;
      }
    | undefined;

export const useImpactMetricsApi = (params?: UseImpactMetricsApiParams) => {
    const basePath = params
        ? `api/admin/projects/${params.projectId}/features/${params.featureName}/impact-metrics/config`
        : `api/admin/impact-metrics/config`;

    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createImpactMetric = useCallback(
        async (config: CreateImpactMetricsConfigSchema) => {
            const req = createRequest(
                basePath,
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
            const req = createRequest(
                `${basePath}/${metricId}`,
                {
                    method: 'DELETE',
                },
                'deleteImpactMetric',
            );

            return makeRequest(req.caller, req.id);
        },
        [makeRequest, createRequest, basePath],
    );

    return {
        createImpactMetric,
        deleteImpactMetric,
        errors,
        loading,
    };
};
