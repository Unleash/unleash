import useAPI from '../useApi/useApi';

interface ICreatePersonalApiTokenPayload {
    description: string;
    expiresAt: Date;
}

export const usePersonalAPITokensApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createPersonalAPIToken = async (
        payload: ICreatePersonalApiTokenPayload
    ) => {
        const path = `api/admin/user/tokens`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        try {
            const response = await makeRequest(req.caller, req.id);
            return await response.json();
        } catch (e) {
            throw e;
        }
    };

    const deletePersonalAPIToken = async (secret: string) => {
        const path = `api/admin/user/tokens/${secret}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });
        try {
            await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        createPersonalAPIToken,
        deletePersonalAPIToken,
        errors,
        loading,
    };
};
