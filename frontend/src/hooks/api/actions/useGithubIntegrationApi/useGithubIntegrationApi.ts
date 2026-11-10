import useAPI from '../useApi/useApi.js';

export const useGithubIntegrationApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const syncRepositories = async (
        integrationId: number,
    ): Promise<string[]> => {
        const path = `api/admin/integrations/github/${integrationId}/sync-repositories`;
        const req = createRequest(path, {
            method: 'POST',
        });

        const response = await makeRequest(req.caller, req.id);
        const { repositories } = await response.json();
        return repositories;
    };

    return {
        syncRepositories,
        errors,
        loading,
    };
};
