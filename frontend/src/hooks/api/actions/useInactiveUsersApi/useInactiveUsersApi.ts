import useAPI from '../useApi/useApi.js';

export const DEL_INACTIVE_USERS_ERROR = 'delInactiveUsers';
export const useInactiveUsersApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const deleteInactiveUsers = async (userIds: number[]) => {
        const path = `api/admin/user-admin/inactive/delete`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({
                ids: userIds,
            }),
        });
        return makeRequest(req.caller, req.id);
    };

    return { deleteInactiveUsers, errors, loading };
};
