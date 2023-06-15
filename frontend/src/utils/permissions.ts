import { IPermission, ICheckedPermissions } from 'interfaces/permissions';
import cloneDeep from 'lodash.clonedeep';

const getRoleKey = (permission: IPermission): string => {
    return permission.environment
        ? `${permission.id}-${permission.environment}`
        : `${permission.id}`;
};

export const permissionsToCheckedPermissions = (
    permissions: IPermission[]
): ICheckedPermissions =>
    permissions.reduce(
        (
            checkedPermissions: { [key: string]: IPermission },
            permission: IPermission
        ) => {
            checkedPermissions[getRoleKey(permission)] = permission;
            return checkedPermissions;
        },
        {}
    );

export const togglePermission = (
    checkedPermissions: ICheckedPermissions,
    permission: IPermission
): ICheckedPermissions => {
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
): ICheckedPermissions => {
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
