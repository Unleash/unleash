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
        const req = createRequest('api/admin/user/tokens', {
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
        const req = createRequest(`api/admin/user/tokens/${secret}`, {
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
