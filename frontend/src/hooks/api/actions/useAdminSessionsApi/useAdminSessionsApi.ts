import useAPI from '../useApi/useApi.js';

const useAdminSessionsApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const deleteSession = async (id: string) => {
        const req = createRequest(
            `api/admin/sessions/${encodeURIComponent(id)}`,
            { method: 'DELETE' },
            'deleteSession',
        );
        return makeRequest(req.caller, req.id);
    };

    const deleteSessionsForUser = async (userId: number) => {
        const req = createRequest(
            `api/admin/sessions/user/${encodeURIComponent(userId)}`,
            { method: 'DELETE' },
            'deleteSessionsForUser',
        );
        return makeRequest(req.caller, req.id);
    };

    return { deleteSession, deleteSessionsForUser, loading, errors };
};

export default useAdminSessionsApi;
