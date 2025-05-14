import useAPI from '../useApi/useApi.js';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useCallback } from 'react';
import type { FeatureLinkSchema } from 'openapi';

export const useFeatureLinkApi = (project: string, feature: string) => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addLink = async (linkSchema: FeatureLinkSchema) => {
        const req = createRequest(
            `/api/admin/projects/${project}/features/${feature}/link`,
            {
                method: 'POST',
                body: JSON.stringify(linkSchema),
            },
        );
        await makeRequest(req.caller, req.id);
    };

    const editLink = async (linkId: string, linkSchema: FeatureLinkSchema) => {
        const req = createRequest(
            `/api/admin/projects/${project}/features/${feature}/link/${linkId}`,
            {
                method: 'PUT',
                body: JSON.stringify(linkSchema),
            },
        );
        await makeRequest(req.caller, req.id);
    };

    const deleteLink = async (linkId: string) => {
        const req = createRequest(
            `/api/admin/projects/${project}/features/${feature}/link/${linkId}`,
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
        addLink: useCallback(addLink, callbackDeps),
        editLink: useCallback(editLink, callbackDeps),
        deleteLink: useCallback(deleteLink, callbackDeps),
        errors,
        loading,
    };
};
