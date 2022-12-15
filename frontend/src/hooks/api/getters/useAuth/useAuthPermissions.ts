import { IPermission } from 'interfaces/user';
import { IUseAuthEndpointOutput, useAuthEndpoint } from './useAuthEndpoint';
import useUiConfig from '../useUiConfig/useUiConfig';
import { IUiConfig } from '../../../../interfaces/uiConfig';

interface IUseAuthPermissionsOutput {
    permissions?: IPermission[];
    refetchPermissions: () => void;
    loading: boolean;
    error?: Error;
}

const getPermissions = (
    auth: IUseAuthEndpointOutput,
    uiConfig: IUiConfig
): IPermission[] | undefined => {
    let permissions =
        auth.data && 'permissions' in auth.data && !uiConfig?.flags?.maintenance
            ? auth.data.permissions
            : undefined;

    return permissions;
};

export const useAuthPermissions = (): IUseAuthPermissionsOutput => {
    const auth = useAuthEndpoint();
    const { uiConfig } = useUiConfig();
    const permissions = getPermissions(auth, uiConfig);

    return {
        permissions,
        refetchPermissions: auth.refetchAuth,
        loading: auth.loading,
        error: auth.error,
    };
};
