import type { INewPersonalAPIToken } from 'interfaces/personalAPIToken';
import useAPI from '../useApi/useApi.js';

export interface ICreateServiceAccountTokenPayload {
    description: string;
    expiresAt: Date;
}

export const useServiceAccountTokensApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createServiceAccountToken = async (
        serviceAccountId: number,
        payload: ICreateServiceAccountTokenPayload,
    ): Promise<INewPersonalAPIToken> => {
        const req = createRequest(
            `api/admin/service-account/${serviceAccountId}/token`,
            {
                method: 'POST',
                body: JSON.stringify(payload),
            },
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const deleteServiceAccountToken = async (
        serviceAccountId: number,
        id: string,
    ) => {
        const req = createRequest(
            `api/admin/service-account/${serviceAccountId}/token/${id}`,
            {
                method: 'DELETE',
            },
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        createServiceAccountToken,
        deleteServiceAccountToken,
        errors,
        loading,
    };
};
