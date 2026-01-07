import type { IPermission } from '../../types/index.js';
import type { IUserPermission } from '../../types/stores/access-store.js';

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
