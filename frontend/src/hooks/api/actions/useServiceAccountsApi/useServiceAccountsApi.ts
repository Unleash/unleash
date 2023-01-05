import useAPI from '../useApi/useApi';

export interface IServiceAccountPayload {
    name: string;
    username: string;
    rootRole: number;
}

export const useServiceAccountsApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addServiceAccount = async (
        serviceAccount: IServiceAccountPayload
    ) => {
        const requestId = 'addServiceAccount';
        const req = createRequest(
            'api/admin/service-account',
            {
                method: 'POST',
                body: JSON.stringify(serviceAccount),
            },
            requestId
        );

        const response = await makeRequest(req.caller, req.id);
        return await response.json();
    };

    const removeServiceAccount = async (serviceAccountId: number) => {
        const requestId = 'removeServiceAccount';
        const req = createRequest(
            `api/admin/service-account/${serviceAccountId}`,
            { method: 'DELETE' },
            requestId
        );

        await makeRequest(req.caller, req.id);
    };

    const updateServiceAccount = async (
        serviceAccountId: number,
        serviceAccount: IServiceAccountPayload
    ) => {
        const requestId = 'updateServiceAccount';
        const req = createRequest(
            `api/admin/service-account/${serviceAccountId}`,
            {
                method: 'PUT',
                body: JSON.stringify(serviceAccount),
            },
            requestId
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        addServiceAccount,
        updateServiceAccount,
        removeServiceAccount,
        errors,
        loading,
    };
};
