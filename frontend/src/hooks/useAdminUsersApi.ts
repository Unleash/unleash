import { useState } from 'react';
import {
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
    OK,
    UNAUTHORIZED,
} from '../constants/statusCodes';
import { IUserPayload } from '../interfaces/user';
import {
    AuthenticationError,
    ForbiddenError,
    headers,
    NotFoundError,
} from '../store/api-helper';

export interface IUserApiErrors {
    addUser?: string;
    removeUser?: string;
    updateUser?: string;
    changePassword?: string;
    validatePassword?: string;
}

export const ADD_USER_ERROR = 'addUser';
export const UPDATE_USER_ERROR = 'updateUser';
export const REMOVE_USER_ERROR = 'removeUser';
export const CHANGE_PASSWORD_ERROR = 'changePassword';
export const VALIDATE_PASSWORD_ERROR = 'validatePassword';

const useAdminUsersApi = () => {
    const [userApiErrors, setUserApiErrors] = useState({});
    const [userLoading, setUserLoading] = useState(false);

    const defaultOptions: RequestInit = {
        headers,
        credentials: 'include',
    };

    const makeRequest = async (
        apiCaller: any,
        type: string
    ): Promise<Response> => {
        setUserLoading(true);
        try {
            const res = await apiCaller();
            setUserLoading(false);
            if (res.status > 299) {
                await handleResponses(res, type);
            }

            if (res.status === OK) {
                setUserApiErrors({});
            }

            return res;
        } catch (e) {
            setUserLoading(false);
            throw e;
        }
    };

    const addUser = async (user: IUserPayload) => {
        return makeRequest(() => {
            return fetch('api/admin/user-admin', {
                ...defaultOptions,
                method: 'POST',
                body: JSON.stringify(user),
            });
        }, 'addUser');
    };

    const removeUser = async (user: IUserPayload) => {
        return makeRequest(() => {
            return fetch(`api/admin/user-admin/${user.id}`, {
                ...defaultOptions,
                method: 'DELETE',
            });
        }, 'removeUser');
    };

    const updateUser = async (user: IUserPayload) => {
        return makeRequest(() => {
            return fetch(`api/admin/user-admin/${user.id}`, {
                ...defaultOptions,
                method: 'PUT',
                body: JSON.stringify(user),
            });
        }, 'updateUser');
    };

    const changePassword = async (user: IUserPayload, password: string) => {
        return makeRequest(() => {
            return fetch(`api/admin/user-admin/${user.id}/change-password`, {
                ...defaultOptions,
                method: 'POST',
                body: JSON.stringify({ password }),
            });
        }, 'changePassword');
    };

    const validatePassword = async (password: string) => {
        return makeRequest(() => {
            return fetch(`api/admin/user-admin/validate-password`, {
                ...defaultOptions,
                method: 'POST',
                body: JSON.stringify({ password }),
            });
        }, 'validatePassword');
    };

    const handleResponses = async (res: Response, type: string) => {
        if (res.status === BAD_REQUEST) {
            const data = await res.json();

            setUserApiErrors(prev => ({
                ...prev,
                [type]: data[0].msg,
            }));

            throw new Error();
        }

        if (res.status === NOT_FOUND) {
            setUserApiErrors(prev => ({
                ...prev,
                [type]: 'Could not find the requested resource.',
            }));

            throw new NotFoundError(res.status);
        }

        if (res.status === UNAUTHORIZED) {
            const data = await res.json();

            setUserApiErrors(prev => ({
                ...prev,
                [type]: data[0].msg,
            }));

            throw new AuthenticationError(res.status);
        }

        if (res.status === FORBIDDEN) {
            const data = await res.json();

            setUserApiErrors(prev => ({
                ...prev,
                [type]: data[0].msg,
            }));

            throw new ForbiddenError(res.status);
        }
    };

    return {
        addUser,
        updateUser,
        removeUser,
        changePassword,
        validatePassword,
        userApiErrors,
        userLoading,
    };
};

export default useAdminUsersApi;
