import { headers } from 'utils/apiUtils';
import useAPI from '../useApi/useApi';

type PasswordLogin = (
    path: string,
    username: string,
    password: string
) => Promise<Response>;

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

    const passwordAuth = (path: string, username: string, password: string) => {
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

        return makeRequest(req.caller, req.id);
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
