import type { IUser } from '@server/types';
import { useAuthEndpoint } from './useAuthEndpoint';

interface IUseAuthUserOutput {
    user?: IUser;
    refetchUser: () => void;
    loading: boolean;
    error?: Error;
}

export const useAuthUser = (): IUseAuthUserOutput => {
    const auth = useAuthEndpoint();
    const user = auth.data && 'user' in auth.data ? auth.data.user : undefined;

    return {
        user,
        refetchUser: auth.refetchAuth,
        loading: auth.loading,
        error: auth.error,
    };
};
