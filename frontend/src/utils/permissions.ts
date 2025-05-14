import { ROOT_PERMISSION_CATEGORIES } from '@server/types/permissions';
import {
    ENVIRONMENT_PERMISSION_TYPE,
    PROJECT_PERMISSION_TYPE,
} from '@server/util/constants';
import type {
    IPermission,
    ICheckedPermissions,
    IPermissionCategory,
    IProjectEnvironmentPermissions,
} from 'interfaces/permissions';
import cloneDeep from 'lodash.clonedeep';

export const getRoleKey = (permission: IPermission): string => {
    return permission.environment
        ? `${permission.name}-${permission.environment}`
        : `${permission.name}`;
};

export const permissionsToCheckedPermissions = (
    permissions: IPermission[],
): ICheckedPermissions =>
    permissions.reduce(
        (
            checkedPermissions: { [key: string]: IPermission },
            permission: IPermission,
        ) => {
            checkedPermissions[getRoleKey(permission)] = permission;
            return checkedPermissions;
        },
        {},
    );

export const togglePermission = (
    checkedPermissions: ICheckedPermissions,
    permission: IPermission,
): ICheckedPermissions => {
    const checkedPermissionsCopy = cloneDeep(checkedPermissions);

    if (checkedPermissionsCopy[getRoleKey(permission)]) {
        delete checkedPermissionsCopy[getRoleKey(permission)];
    } else {
        checkedPermissionsCopy[getRoleKey(permission)] = { ...permission };
    }

    return checkedPermissionsCopy;
};

export const toggleAllPermissions = (
    checkedPermissions: ICheckedPermissions,
    toggledPermissions: IPermission[],
): ICheckedPermissions => {
    const checkedPermissionsCopy = cloneDeep(checkedPermissions);

    const allChecked = toggledPermissions.every(
        (permission: IPermission) =>
            checkedPermissionsCopy[getRoleKey(permission)],
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

export const getCategorizedRootPermissions = (permissions: IPermission[]) => {
    const rootPermissions = permissions.filter(({ name }) => name !== 'ADMIN');

    const categories = rootPermissions.reduce(
        (categories: IPermissionCategory[], permission) => {
            const categoryLabel =
                ROOT_PERMISSION_CATEGORIES.find((category) =>
                    category.permissions.includes(permission.name),
                )?.label || 'Other';

            const category = categories.find(
                ({ label }) => label === categoryLabel,
            );

            if (category) {
                category.permissions.push(permission);
            } else {
                categories.push({
                    label: categoryLabel,
                    type: 'root',
                    permissions: [permission],
                });
            }

            return categories;
        },
        [],
    );

    return categories
        .map((category) => ({
            ...category,
            permissions: [
                ...new Set(
                    category.permissions.sort((a, b) =>
                        a.displayName.localeCompare(b.displayName),
                    ),
                ),
            ],
        }))
        .sort(sortCategories);
};

export const getCategorizedProjectPermissions = (
    permissions: IPermission[],
) => {
    const projectPermissions = permissions.filter(
        ({ type }) => type === PROJECT_PERMISSION_TYPE,
    );
    const environmentPermissions = permissions.filter(
        ({ type }) => type === ENVIRONMENT_PERMISSION_TYPE,
    );

    const categories: IPermissionCategory[] = [];

    if (projectPermissions.length) {
        categories.push({
            label: 'Project',
            type: 'project',
            permissions: projectPermissions,
        });
    }

    categories.push(
        ...environmentPermissions.reduce(
            (categories: IPermissionCategory[], permission) => {
                const categoryLabel = permission.environment;

                const category = categories.find(
                    ({ label }) => label === categoryLabel,
                );

                if (category) {
                    category.permissions.push(permission);
                } else {
                    categories.push({
                        label: categoryLabel!,
                        type: 'environment',
                        permissions: [permission],
                    });
                }

                return categories;
            },
            [],
        ),
    );

    return categories.map((category) => ({
        ...category,
        permissions: [
            ...new Set(
                category.permissions.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName),
                ),
            ),
        ],
    }));
};

export const flattenProjectPermissions = (
    projectPermissions: IPermission[],
    environmentPermissions: IProjectEnvironmentPermissions[],
) => [
    ...projectPermissions,
    ...environmentPermissions.flatMap(({ permissions }) => permissions),
];

const sortCategories = (
    { label: aLabel }: IPermissionCategory,
    { label: bLabel }: IPermissionCategory,
) => {
    if (aLabel === 'Other' && bLabel !== 'Other') {
        return 1;
    } else if (aLabel !== 'Other' && bLabel === 'Other') {
        return -1;
    } else {
        return aLabel.localeCompare(bLabel);
    }
};
