import useAPI from '../useApi/useApi';

export interface IApiTokenCreate {
    username: string;
    type: string;
    project: string;
    environment?: string;
}

const useApiTokensApi = () => {
    const { makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const deleteToken = async (secret: string) => {
        const path = `api/admin/api-tokens/${secret}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const createToken = async (newToken: IApiTokenCreate) => {
        const path = `api/admin/api-tokens`;
        const req = createRequest(path, { method: 'POST', body: JSON.stringify(newToken) });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    return { deleteToken, createToken, errors };
};

export default useApiTokensApi;
