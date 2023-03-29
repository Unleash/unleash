import useAPI from '../useApi/useApi';

export const useNotificationsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const markAsRead = async (payload: { notifications: number[] }) => {
        const path = `api/admin/notifications/read`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        try {
            await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        loading,
        errors,
        markAsRead,
    };
};
