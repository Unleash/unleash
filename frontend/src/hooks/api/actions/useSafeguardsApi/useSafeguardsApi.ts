import useAPI from '../useApi/useApi.js';
import type { CreateSafeguardSchema } from 'openapi/models/createSafeguardSchema';

export interface CreateSafeguardParams {
    projectId: string;
    featureName: string;
    environment: string;
    planId: string;
    body: CreateSafeguardSchema;
}

export interface DeleteSafeguardParams {
    projectId: string;
    featureName: string;
    environment: string;
    planId: string;
    safeguardId: string;
}

export const useSafeguardsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createOrUpdateSafeguard = async ({
        projectId,
        featureName,
        environment,
        planId,
        body,
    }: CreateSafeguardParams): Promise<void> => {
        const requestId = 'createOrUpdateSafeguard';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release-plans/${planId}/safeguards`;
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

    const deleteSafeguard = async ({
        projectId,
        featureName,
        environment,
        planId,
        safeguardId,
    }: DeleteSafeguardParams): Promise<void> => {
        const requestId = 'deleteSafeguard';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release-plans/${planId}/safeguards/${safeguardId}`;
        const req = createRequest(
            path,
            {
                method: 'DELETE',
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        createOrUpdateSafeguard,
        deleteSafeguard,
        errors,
        loading,
    };
};
