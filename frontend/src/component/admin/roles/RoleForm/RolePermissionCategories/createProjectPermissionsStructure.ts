import {
    type ProjectPermissionCategory,
    PROJECT_PERMISSIONS_STRUCTURE,
} from '@server/types/permissions';
import type { IPermission } from 'interfaces/permissions';
import { getRoleKey } from 'utils/permissions';

export const createProjectPermissionsStructure = (
    permissions: IPermission[],
) => {
    const allPermissions =
        permissions?.map((permission) => getRoleKey(permission)).sort() || [];

    const allStructuredPermissions = PROJECT_PERMISSIONS_STRUCTURE.flatMap(
        (category) => category.permissions.map(([permission]) => permission),
    ).sort() as string[];

    const otherPermissions = allPermissions.filter(
        (permission) => !allStructuredPermissions.includes(permission),
    );

    const permissionsStructure = [
        ...PROJECT_PERMISSIONS_STRUCTURE,
        {
            label: 'Other',
            permissions: otherPermissions.map((p) => [p]),
        } as ProjectPermissionCategory,
    ]
        .map((category) => ({
            label: category.label,
            permissions: category.permissions
                .filter(([permission]) => allPermissions.includes(permission))
                .map(([permission, parentPermission]) => [
                    permissions.find((p) => getRoleKey(p) === permission),
                    parentPermission,
                ]) as [IPermission, string?][],
        }))
        .filter((category) => category.permissions.length > 0);

    return permissionsStructure;
};
