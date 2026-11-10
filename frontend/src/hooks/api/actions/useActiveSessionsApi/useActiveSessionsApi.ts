import useAPI from '../useApi/useApi.js';

export const useActiveSessionsApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const revokeSession = async (id: string) => {
        const requestId = 'revokeSession';
        const req = createRequest(
            `api/admin/user-sessions/${id}`,
            { method: 'DELETE' },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        revokeSession,
        errors,
        loading,
    };
};
