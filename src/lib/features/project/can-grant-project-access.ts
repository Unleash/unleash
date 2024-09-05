import type { IPermission } from '../../types';
import type { IUserPermission } from '../../types/stores/access-store';

export const canGrantProjectRole = (
    granterPermissions: IUserPermission[],
    receiverPermissions: IPermission[],
) => {
    return receiverPermissions.every((receiverPermission) => {
        return granterPermissions.some((granterPermission) => {
            if (granterPermission.environment) {
                return (
                    granterPermission.permission === receiverPermission.name &&
                    granterPermission.environment ===
                        receiverPermission.environment
                );
            }

            return granterPermission.permission === receiverPermission.name;
        });
    });
};
