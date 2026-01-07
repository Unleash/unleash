import useAPI from '../useApi/useApi.js';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useCallback } from 'react';
import type { DependentFeatureSchema } from 'openapi';

export const useDependentFeaturesApi = (project: string) => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addDependency = async (
        childFeature: string,
        parentFeaturePayload: DependentFeatureSchema,
    ) => {
        const req = createRequest(
            `/api/admin/projects/${project}/features/${childFeature}/dependencies`,
            {
                method: 'POST',
                body: JSON.stringify(parentFeaturePayload),
            },
        );
        await makeRequest(req.caller, req.id);
    };

    const removeDependency = async (
        childFeature: string,
        parentFeature: string,
    ) => {
        const req = createRequest(
            `/api/admin/projects/${project}/features/${childFeature}/dependencies/${parentFeature}`,
            {
                method: 'DELETE',
            },
        );
        await makeRequest(req.caller, req.id);
    };

    const removeDependencies = async (childFeature: string) => {
        const req = createRequest(
            `/api/admin/projects/${project}/features/${childFeature}/dependencies`,
            {
                method: 'DELETE',
            },
        );
        await makeRequest(req.caller, req.id);
    };

    const callbackDeps = [
        createRequest,
        makeRequest,
        formatUnknownError,
        project,
    ];
    return {
        addDependency: useCallback(addDependency, callbackDeps),
        removeDependency: useCallback(removeDependency, callbackDeps),
        removeDependencies: useCallback(removeDependencies, callbackDeps),
        errors,
        loading,
    };
};
