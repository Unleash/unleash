import type { IPermission } from 'interfaces/user';
import {
    type IUseAuthEndpointOutput,
    useAuthEndpoint,
} from './useAuthEndpoint.js';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { IUiConfig } from 'interfaces/uiConfig';
import { MAINTENANCE_MODE_PERMISSIONS } from '@server/types/permissions';

interface IUseAuthPermissionsOutput {
    permissions?: IPermission[];
    refetchPermissions: () => void;
    loading: boolean;
    error?: Error;
}

const getPermissions = (
    auth: IUseAuthEndpointOutput,
    uiConfig: IUiConfig,
): IPermission[] | undefined => {
    let permissions =
        auth.data && 'permissions' in auth.data
            ? auth.data.permissions
            : undefined;
    if (permissions && uiConfig?.maintenanceMode) {
        permissions = permissions.filter((permission) =>
            MAINTENANCE_MODE_PERMISSIONS.includes(permission.permission),
        );
    }
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
