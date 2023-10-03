import { INewPersonalAPIToken } from 'interfaces/personalAPIToken';
import useAPI from '../useApi/useApi';

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
        payload: ICreateServiceAccountTokenPayload
    ): Promise<INewPersonalAPIToken> => {
        const req = createRequest(
            `api/admin/service-account/${serviceAccountId}/token`,
            {
                method: 'POST',
                body: JSON.stringify(payload),
            }
        );
        try {
            const response = await makeRequest(req.caller, req.id);
            return await response.json();
        } catch (e) {
            throw e;
        }
    };

    const deleteServiceAccountToken = async (
        serviceAccountId: number,
        id: string
    ) => {
        const req = createRequest(
            `api/admin/service-account/${serviceAccountId}/token/${id}`,
            {
                method: 'DELETE',
            }
        );
        try {
            await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        createServiceAccountToken,
        deleteServiceAccountToken,
        errors,
        loading,
    };
};
