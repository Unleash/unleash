import { IPermission } from '../../../../interfaces/user';
import { useAuthEndpoint } from './useAuthEndpoint';

interface IUseAuthPermissionsOutput {
    permissions?: IPermission[];
    refetchPermissions: () => void;
    loading: boolean;
    error?: Error;
}

export const useAuthPermissions = (): IUseAuthPermissionsOutput => {
    const auth = useAuthEndpoint();
    const permissions =
        auth.data && 'permissions' in auth.data
            ? auth.data.permissions
            : undefined;

    return {
        permissions,
        refetchPermissions: auth.refetchAuth,
        loading: auth.loading,
        error: auth.error,
    };
};
