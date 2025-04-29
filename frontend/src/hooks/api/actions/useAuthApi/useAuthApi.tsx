import { headers } from 'utils/apiUtils';
import useAPI from '../useApi/useApi.ts';
import type { UserSchema } from 'openapi';

type PasswordLogin = (
    path: string,
    username: string,
    password: string,
) => Promise<UserSchema>;

type EmailLogin = (path: string, email: string) => Promise<Response>;

interface IUseAuthApiOutput {
    passwordAuth: PasswordLogin;
    emailAuth: EmailLogin;
    errors: Record<string, string>;
    loading: boolean;
}

export const useAuthApi = (): IUseAuthApiOutput => {
    const { makeRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const passwordAuth = async (
        path: string,
        username: string,
        password: string,
    ): Promise<UserSchema> => {
        const req = {
            caller: () => {
                return fetch(path, {
                    headers,
                    method: 'POST',
                    body: JSON.stringify({ username, password }),
                });
            },
            id: 'passwordAuth',
        };

        const res = await makeRequest(req.caller, req.id);
        const data = await res.json();

        return data;
    };

    const emailAuth = (path: string, email: string) => {
        const req = {
            caller: () => {
                return fetch(path, {
                    headers,
                    method: 'POST',
                    body: JSON.stringify({ email }),
                });
            },
            id: 'emailAuth',
        };

        return makeRequest(req.caller, req.id);
    };

    return {
        passwordAuth,
        emailAuth,
        errors,
        loading,
    };
};
