import useAPI from '../useApi/useApi.js';
import type { CreateSafeguardSchema } from 'openapi/models/createSafeguardSchema';

export const useSafeguardsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createOrUpdateSafeguard = async (
        projectId: string,
        featureName: string,
        environment: string,
        planId: string,
        body: CreateSafeguardSchema,
    ): Promise<void> => {
        const requestId = 'createOrUpdateSafeguard';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release_plans/${planId}/safeguards`;
        const req = createRequest(
            path,
            {
                method: 'PUT',
                body: JSON.stringify(body),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        createOrUpdateSafeguard,
        errors,
        loading,
    };
};
