import useAPI from '../useApi/useApi';

export interface IApiTokenCreate {
    username: string;
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

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const createToken = async (newToken: IApiTokenCreate, project: string) => {
        const path = `api/admin/projects/${project}/api-tokens`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(newToken),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    return { deleteToken, createToken, errors, loading };
};

export default useProjectApiTokensApi;
