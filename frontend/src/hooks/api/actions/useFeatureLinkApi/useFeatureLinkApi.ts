import useAPI from '../useApi/useApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useCallback } from 'react';

export const useFeatureLinkApi = (project: string, feature: string) => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addLink = async (linkSchema: {
        url: string;
        title: string | null;
    }) => {
        const req = createRequest(
            `/api/admin/projects/${project}/features/${feature}/link`,
            {
                method: 'POST',
                body: JSON.stringify(linkSchema),
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
        errors,
        loading,
    };
};
