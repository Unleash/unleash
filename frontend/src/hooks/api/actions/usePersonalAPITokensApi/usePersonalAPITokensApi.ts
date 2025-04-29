import type { INewPersonalAPIToken } from 'interfaces/personalAPIToken';
import useAPI from '../useApi/useApi.js';

export interface ICreatePersonalApiTokenPayload {
    description: string;
    expiresAt: Date;
}

export const usePersonalAPITokensApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createPersonalAPIToken = async (
        payload: ICreatePersonalApiTokenPayload,
    ): Promise<INewPersonalAPIToken> => {
        const req = createRequest('api/admin/user/tokens', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const deletePersonalAPIToken = async (id: string) => {
        const req = createRequest(`api/admin/user/tokens/${id}`, {
            method: 'DELETE',
        });

        await makeRequest(req.caller, req.id);
    };

    return {
        createPersonalAPIToken,
        deletePersonalAPIToken,
        errors,
        loading,
    };
};
