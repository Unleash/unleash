import useAPI from '../useApi/useApi';
export const useInactiveUsersApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const deleteInactiveUsers = async () => {
        const path = `api/admin/user-admin/inactive`;
        const req = createRequest(path, {
            method: 'DELETE',
        });
        return makeRequest(req.caller, req.id);
    };

    return { deleteInactiveUsers, errors, loading };
};
