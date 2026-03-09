import useAPI from '../useApi/useApi.js';
import type { CreateSafeguardSchema } from 'openapi/models/createSafeguardSchema';

interface SafeguardEnvironmentParams {
    projectId: string;
    featureName: string;
    environment: string;
}

export type CreateReleasePlanSafeguardParams = SafeguardEnvironmentParams & {
    planId: string;
    body: CreateSafeguardSchema;
};

export type CreateFeatureEnvironmentSafeguardParams =
    SafeguardEnvironmentParams & {
        body: CreateSafeguardSchema;
    };

export type DeleteReleasePlanSafeguardParams = SafeguardEnvironmentParams & {
    planId: string;
    safeguardId: string;
};

export type DeleteFeatureEnvironmentSafeguardParams =
    SafeguardEnvironmentParams & {
        safeguardId: string;
    };

export const useSafeguardsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createOrUpdateReleasePlanSafeguard = async ({
        projectId,
        featureName,
        environment,
        planId,
        body,
    }: CreateReleasePlanSafeguardParams): Promise<void> => {
        const requestId = 'createOrUpdateReleasePlanSafeguard';
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

    const createOrUpdateFeatureEnvironmentSafeguard = async ({
        projectId,
        featureName,
        environment,
        body,
    }: CreateFeatureEnvironmentSafeguardParams): Promise<void> => {
        const requestId = 'createOrUpdateFeatureEnvironmentSafeguard';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/safeguards`;
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

    const deleteReleasePlanSafeguard = async ({
        projectId,
        featureName,
        environment,
        planId,
        safeguardId,
    }: DeleteReleasePlanSafeguardParams): Promise<void> => {
        const requestId = 'deleteReleasePlanSafeguard';
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

    const deleteFeatureEnvironmentSafeguard = async ({
        projectId,
        featureName,
        environment,
        safeguardId,
    }: DeleteFeatureEnvironmentSafeguardParams): Promise<void> => {
        const requestId = 'deleteFeatureEnvironmentSafeguard';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/safeguards/${safeguardId}`;
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
        createOrUpdateReleasePlanSafeguard,
        createOrUpdateFeatureEnvironmentSafeguard,
        deleteReleasePlanSafeguard,
        deleteFeatureEnvironmentSafeguard,
        errors,
        loading,
    };
};
