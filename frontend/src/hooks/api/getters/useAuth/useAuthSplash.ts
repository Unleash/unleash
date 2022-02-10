import { IAuthSplash, useAuthEndpoint } from './useAuthEndpoint';

interface IUseAuthSplashOutput {
    splash?: IAuthSplash;
    refetchSplash: () => void;
    loading: boolean;
    error?: Error;
}

export const useAuthSplash = (): IUseAuthSplashOutput => {
    const auth = useAuthEndpoint();
    const splash =
        auth.data && 'splash' in auth.data ? auth.data.splash : undefined;

    return {
        splash,
        refetchSplash: auth.refetchAuth,
        loading: auth.loading,
        error: auth.error,
    };
};
