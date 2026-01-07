import useAPI from '../useApi/useApi.js';

export interface IApiTokenCreate {
    tokenName: string;
    type: string;
    environment?: string;
    projects: string[];
}

const useProjectApiTokensApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const deleteToken = async (secret: string, project: string) => {
        const path = `api/admin/projects/${project}/api-tokens/${secret}`;
        const req = createRequest(path, { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
    };

    const createToken = async (newToken: IApiTokenCreate, project: string) => {
        const path = `api/admin/projects/${project}/api-tokens`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(newToken),
        });

        return makeRequest(req.caller, req.id);
    };

    return { deleteToken, createToken, errors, loading };
};

export default useProjectApiTokensApi;
