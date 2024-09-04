import { IPermission } from '../../types';
import { IUserPermission } from '../../types/stores/access-store';

export const canGrantProjectRole = (
    granterPermissions: IUserPermission[],
    receiverPermissions: IPermission[],
) => {
    return receiverPermissions.every((receiverPermission) => {
        return granterPermissions.some(
            (granterPermission) =>
                granterPermission.permission === receiverPermission.name,
        );
    });
};
