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
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const passwordAuth = (path: string, username: string, password: string) => {
        const req = createRequest(ensureRelativePath(path), {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        return makeRequest(req.caller, req.id);
    };

    const emailAuth = (path: string, email: string) => {
        const req = createRequest(ensureRelativePath(path), {
            method: 'POST',
            body: JSON.stringify({ email }),
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        passwordAuth,
        emailAuth,
        errors,
        loading,
    };
};

const ensureRelativePath = (path: string): string => {
    return path.replace(/^\//, '');
};
