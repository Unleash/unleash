import { IPermission, ICheckedPermissions } from 'interfaces/permissions';
import cloneDeep from 'lodash.clonedeep';

export const getRoleKey = (permission: IPermission): string => {
    return permission.environment
        ? `${permission.id}-${permission.environment}`
        : `${permission.id}`;
};

export const togglePermission = (
    checkedPermissions: ICheckedPermissions,
    permission: IPermission
) => {
    let checkedPermissionsCopy = cloneDeep(checkedPermissions);

    if (checkedPermissionsCopy[getRoleKey(permission)]) {
        delete checkedPermissionsCopy[getRoleKey(permission)];
    } else {
        checkedPermissionsCopy[getRoleKey(permission)] = { ...permission };
    }

    return checkedPermissionsCopy;
};

export const toggleAllPermissions = (
    checkedPermissions: ICheckedPermissions,
    toggledPermissions: IPermission[]
) => {
    let checkedPermissionsCopy = cloneDeep(checkedPermissions);

    const allChecked = toggledPermissions.every(
        (permission: IPermission) =>
            checkedPermissionsCopy[getRoleKey(permission)]
    );

    if (allChecked) {
        toggledPermissions.forEach((permission: IPermission) => {
            delete checkedPermissionsCopy[getRoleKey(permission)];
        });
    } else {
        toggledPermissions.forEach((permission: IPermission) => {
            checkedPermissionsCopy[getRoleKey(permission)] = {
                ...permission,
            };
        });
    }

    return checkedPermissionsCopy;
};
