import useAPI from '../useApi/useApi.js';

export interface IApiTokenCreate {
    tokenName: string;
    type: string;
    environment?: string;
    projects: string[];
}

const useApiTokensApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const deleteToken = async (secret: string) => {
        const path = `api/admin/api-tokens/${secret}`;
        const req = createRequest(path, { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
    };

    const createToken = async (newToken: IApiTokenCreate) => {
        const path = `api/admin/api-tokens`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(newToken),
        });

        return makeRequest(req.caller, req.id);
    };

    return { deleteToken, createToken, errors, loading };
};

export default useApiTokensApi;
