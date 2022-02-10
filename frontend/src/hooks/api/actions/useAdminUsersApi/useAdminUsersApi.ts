import useAPI from '../useApi/useApi';
import {
    handleBadRequest,
    handleForbidden,
    handleNotFound,
    handleUnauthorized,
} from './errorHandlers';

export interface IUserApiErrors {
    addUser?: string;
    removeUser?: string;
    updateUser?: string;
    changePassword?: string;
    validatePassword?: string;
}

interface IUserPayload {
    name: string;
    email: string;
    id?: string;
}

export const ADD_USER_ERROR = 'addUser';
export const UPDATE_USER_ERROR = 'updateUser';
export const REMOVE_USER_ERROR = 'removeUser';
export const CHANGE_PASSWORD_ERROR = 'changePassword';
export const VALIDATE_PASSWORD_ERROR = 'validatePassword';

const useAdminUsersApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        handleBadRequest,
        handleNotFound,
        handleUnauthorized,
        handleForbidden,
    });

    const addUser = async (user: IUserPayload) => {
        const requestId = 'addUser';
        const req = createRequest(
            'api/admin/user-admin',
            {
                method: 'POST',
                body: JSON.stringify(user),
            },
            requestId
        );

        return makeRequest(req.caller, req.id);
    };

    const removeUser = async (user: IUserPayload) => {
        const requestId = 'removeUser';
        const req = createRequest(
            `api/admin/user-admin/${user.id}`,
            {
                method: 'DELETE',
            },
            requestId
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
            requestId
        );

        return makeRequest(req.caller, req.id);
    };

    const changePassword = async (user: IUserPayload, password: string) => {
        const requestId = 'changePassword';
        const req = createRequest(
            `api/admin/user-admin/${user.id}/change-password`,
            {
                method: 'POST',
                body: JSON.stringify({ password }),
            },
            requestId
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
            requestId
        );

        return makeRequest(req.caller, req.id);
    };

    return {
        addUser,
        updateUser,
        removeUser,
        changePassword,
        validatePassword,
        userApiErrors: errors,
        userLoading: loading,
    };
};

export default useAdminUsersApi;
