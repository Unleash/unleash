import useAPI from '../useApi/useApi.js';

interface IUserPayload {
    name: string;
    email: string;
    id?: string;
}

export const REMOVE_USER_ERROR = 'removeUser';

const useAdminUsersApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addUser = async (user: IUserPayload) => {
        const requestId = 'addUser';
        const req = createRequest(
            'api/admin/user-admin',
            {
                method: 'POST',
                body: JSON.stringify(user),
            },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    const removeUser = async (userId: number) => {
        const requestId = 'removeUser';
        const req = createRequest(
            `api/admin/user-admin/${userId}`,
            { method: 'DELETE' },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    const updateUser = async (user: IUserPayload) => {
        const requestId = 'updateUser';
        const req = createRequest(
            `api/admin/user-admin/${user.id}`,
            {
                method: 'PUT',
                body: JSON.stringify(user),
            },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    const changePassword = async (userId: number, password: string) => {
        const requestId = 'changePassword';
        const req = createRequest(
            `api/admin/user-admin/${userId}/change-password`,
            {
                method: 'POST',
                body: JSON.stringify({ password }),
            },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    const validatePassword = async (password: string) => {
        const requestId = 'validatePassword';
        const req = createRequest(
            `api/admin/user-admin/validate-password`,
            {
                method: 'POST',
                body: JSON.stringify({ password }),
            },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    const resetPassword = async (email: string) => {
        const requestId = 'resetPassword';
        const req = createRequest(
            'api/admin/user-admin/reset-password',
            {
                method: 'POST',
                body: JSON.stringify({ id: email }),
            },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    const deleteScimUsers = async () => {
        const requestId = 'deleteScimUsers';
        const req = createRequest(
            'api/admin/user-admin/scim-users',
            {
                method: 'DELETE',
            },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    return {
        addUser,
        updateUser,
        removeUser,
        changePassword,
        validatePassword,
        resetPassword,
        deleteScimUsers,
        userApiErrors: errors,
        userLoading: loading,
    };
};

export default useAdminUsersApi;
